from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"
    supabase_url: str = ""
    database_url: str = ""
    # Comma-separated list, e.g. "http://localhost:3000,https://huskies-reconnect.vercel.app"
    cors_origins: str = "http://localhost:3000"
    allowed_email_domain: str = "northeastern.edu"

    gemini_api_key: str = ""
    gemini_embed_model: str = "gemini-embedding-2"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
