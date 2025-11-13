from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    MYSQL_URL: str | None = None
    MONGO_URI: str | None = None
    EXPORT_DIR: str = "app/exports"
    ALLOW_ORIGINS: str = "*"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def allow_origins_list(self):
        return [s.strip() for s in self.ALLOW_ORIGINS.split(",")]

settings = Settings()
os.makedirs(settings.EXPORT_DIR, exist_ok=True)
