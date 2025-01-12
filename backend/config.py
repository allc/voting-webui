from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    frontend_url: str = 'http://localhost:3000'
    google_client_id: str = ''
    google_client_secret: str = ''
    authorized_emails: list[str] = []
    authorized_hds: list[str] = []

    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

settings = Settings()
