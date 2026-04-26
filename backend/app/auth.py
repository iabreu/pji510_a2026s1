"""Autenticação dos dispositivos ESP32 via cabeçalho X-API-Key.

A API key é validada contra a tabela `dispositivos` do Supabase. Se válida,
retorna o dispositivo; caso contrário, lança 401.
"""
from fastapi import Header, HTTPException, status

from app.supabase_client import get_supabase


async def autenticar_dispositivo(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> dict:
    """Valida o header X-API-Key e retorna o dispositivo correspondente."""
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cabeçalho X-API-Key ausente",
        )

    supabase = get_supabase()
    resposta = (
        supabase.table("dispositivos")
        .select("*")
        .eq("api_key", x_api_key)
        .eq("ativo", True)
        .limit(1)
        .execute()
    )

    if not resposta.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida ou dispositivo inativo",
        )

    return resposta.data[0]
