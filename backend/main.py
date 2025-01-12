from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from urllib import parse
import secrets
import requests
from pydantic import BaseModel
import jwt
from .config import settings

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
            raise HTTPException(status_code=401, detail='Not authorized')
    return claims
