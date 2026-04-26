"""Configurações da aplicação carregadas de variáveis de ambiente."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações lidas do .env ou de variáveis de ambiente."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Supabase
    supabase_url: str = Field(..., description="URL do projeto Supabase")
    supabase_service_role_key: str = Field(
        ...,
        description="Service role key do Supabase (NUNCA expor no frontend)",
    )

    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000",
        description="Origens permitidas separadas por vírgula",
    )

    # App
    app_name: str = Field(default="API Monitoramento UNIVESP")
    app_version: str = Field(default="1.0.0")
    debug: bool = Field(default=False)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Retorna instância única (cached) das configurações."""
    return Settings()  # type: ignore[call-arg]
