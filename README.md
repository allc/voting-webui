## Deploy

## Development

1. Copy `.env.prod` to `.env` and fill in the required values
2. Run `docker-compose up`

### Run backend

1. Go to `backend` folder
2. Create and activate a Python virtual environment (Python 3.10 or later)
3. Run `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in the required values
5. Create `data` folder
6. Run `fastapi dev main.py`

### Run frontend

1. Go to `voting-webapp-frontend` folder
2. Run `npm install --force`
3. Run `npm run dev`
