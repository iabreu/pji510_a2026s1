"""Cliente Supabase com a service_role key (bypassa RLS).

Usado pelo backend para gravar leituras (vindas do ESP32) e fornecer
dados ao frontend.
"""
from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def get_supabase() -> Client:
    """Retorna instância única (cached) do cliente Supabase."""
    settings = get_settings()
    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_role_key,
    )
