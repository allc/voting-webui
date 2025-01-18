from datetime import datetime, timedelta, timezone
import hashlib
from typing import Annotated
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from urllib import parse
import secrets
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import requests
from pydantic import BaseModel
import jwt
import json
import os
from openpyxl import load_workbook
from openpyxl.worksheet.worksheet import Worksheet
from .config import settings

bearer_scheme = HTTPBearer()

app = FastAPI()

origins = [
    settings.frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get("/api/auth/google")
def google_auth():
    # https://developers.google.com/identity/protocols/oauth2/web-server#httprest
    client_id = settings.google_client_id
    state = secrets.token_urlsafe(16)
    parameters = {
        'client_id': client_id,
        'redirect_uri': f'{settings.frontend_url}/auth/google',
        'response_type': 'code',
        'scope': 'openid profile email',
        'state': state,
    }
    return {
        'url': f'https://accounts.google.com/o/oauth2/v2/auth?{parse.urlencode(parameters)}',
        'state': state
    }

class GoogleAuthCallback(BaseModel):
    code: str

class TokenData(BaseModel):
    sub: str
    name: str
    picture: str

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.access_token_secret, algorithm='HS256')
    return encoded_jwt

def get_spreadsheet_worksheet(file_path: str):
    wb = load_workbook(file_path)
    ws = wb.active or wb.worksheets[0]
    return ws

def get_spreadsheet_columns(ws: Worksheet):
    columns = []
    for cell in ws[1]:
        columns.append(cell.value)
    return columns

def get_spreadsheet_num_rows(ws: Worksheet):
    return ws.max_row

@app.post("/api/auth/google")
def google_auth_callback(data: GoogleAuthCallback):
    # https://developers.google.com/identity/openid-connect/openid-connect#exchangecode
    request = requests.post('https://oauth2.googleapis.com/token', data={
        'code': data.code,
        'client_id': settings.google_client_id,
        'client_secret': settings.google_client_secret,
        'redirect_uri': f'{settings.frontend_url}/auth/google',
        'grant_type': 'authorization_code',
    })
    if request.status_code != 200:
        raise HTTPException(status_code=request.status_code, detail='Failed to exchange for token from Google')

    id_token = request.json().get('id_token')
    claims = jwt.decode(id_token, options={'verify_signature': False}) # do not need to verify signature as it is directly from Google

    email = claims.get('email') # email may not be unique to a user and may be changed but it is fine for this use case
    email_verified = claims.get('email_verified')
    hd = claims.get('hd')
    if not email or not email_verified:
        raise HTTPException(status_code=401, detail='Email not found or not verified')
    if settings.authorized_emails or settings.authorized_hds:
        if email not in settings.authorized_emails and hd not in settings.authorized_hds:
            raise HTTPException(status_code=401, detail='User not authorized')
    
    token_data = TokenData(sub=email, name=claims.get('name'), picture=claims.get('picture'))
    access_token = create_access_token(token_data.model_dump())
    return {'access_token': access_token}

class User(BaseModel):
    sub: str
    name: str
    picture: str

def get_current_user(token: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]):
    try:
        payload = jwt.decode(token.credentials, settings.access_token_secret, algorithms=['HS256'])
        token_data = TokenData.model_validate(payload)
    except:
        raise HTTPException(status_code=401, detail='Could not validate credentials')
    return User(**token_data.model_dump())

@app.get('/api/auth/profile')
def profile(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@app.post('/api/admin/user-list')
def upload_user_list(
    file: UploadFile,
    current_user: Annotated[User, Depends(get_current_user)],
):
    with open('data/user_list.txt', 'wb') as f:
        f.write(file.file.read())
    try:
        with open('data/user_list.txt', 'r') as f:
            num_lines = sum(1 for line in f if line.strip())
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail='File does not seem to be a text file')
    with open('data/user_list.txt', 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    details = {
        'filename': file.filename,
        'num_users': num_lines, # does not check duplicates
        'file_sha256': file_hash,
        'uploaded_at': datetime.now(timezone.utc).isoformat(),
        'uploaded_by': current_user.sub,
    }
    with open('data/user_list_details.json', 'w') as f:
        f.write(json.dumps(details, indent=2) + '\n')
    return {'message': 'File uploaded'}

@app.get('/api/admin/user-list')
def get_user_list_details():
    if not os.path.exists('data/user_list_details.json'):
        raise HTTPException(status_code=404, detail='User list not found')
    with open('data/user_list_details.json', 'r') as f:
        details = json.load(f)
    return details

@app.delete('/api/admin/user-list')
def delete_user_list():
    if os.path.exists('data/user_list_details.json'):
        os.remove('data/user_list_details.json')
    if os.path.exists('data/user_list.txt'):
        os.remove('data/user_list.txt')
    return {'message': 'User list deleted'}

@app.post('/api/admin/voting-form')
def upload_voting_form(
    file: UploadFile,
    current_user: Annotated[User, Depends(get_current_user)],
):
    with open('data/voting_form.xlsx', 'wb') as f:
        f.write(file.file.read())
    with open('data/voting_form.xlsx', 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    # get spreadsheet info
    try:
        ws = get_spreadsheet_worksheet('data/voting_form.xlsx')
        columns = get_spreadsheet_columns(ws)
        num_responses = get_spreadsheet_num_rows(ws) - 1
    except:
        raise HTTPException(status_code=400, detail='Error occurred, maybe file is not a valid .xlsx file')
    details = {
        'filename': file.filename,
        'file_sha256': file_hash,
        'columns': columns,
        'num_responses': num_responses,
        'uploaded_at': datetime.now(timezone.utc).isoformat(),
        'uploaded_by': current_user.sub,
    }
    with open('data/voting_form_details.json', 'w') as f:
        f.write(json.dumps(details, indent=2) + '\n')
    return {'message': 'File uploaded'}

@app.get('/api/admin/voting-form')
def get_voting_form_details():
    if not os.path.exists('data/voting_form_details.json'):
        raise HTTPException(status_code=404, detail='Voting form not found')
    with open('data/voting_form_details.json', 'r') as f:
        details = json.load(f)
    return details

@app.delete('/api/admin/voting-form')
def delete_voting_form():
    if os.path.exists('data/voting_form_details.json'):
        os.remove('data/voting_form_details.json')
    if os.path.exists('data/voting_form.xlsx'):
        os.remove('data/voting_form.xlsx')
    return {'message': 'Voting form deleted'}
