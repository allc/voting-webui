from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    frontend_url: str = 'http://localhost:3000'

    google_client_id: str = ''
    google_client_secret: str = ''
    authorized_emails: list[str] = []
    authorized_hds: list[str] = []

    access_token_secret: str = ''
    access_token_expire_minutes: int = 60 * 24 * 7 # 7 days

    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

settings = Settings()
