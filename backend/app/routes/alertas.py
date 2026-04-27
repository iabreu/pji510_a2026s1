from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Query

from app.schemas import Alerta
from app.supabase_client import get_supabase

router = APIRouter(prefix="/alertas", tags=["alertas"])

TipoAlerta = Literal[
    "temperatura_alta", "temperatura_baixa",
    "umidade_alta", "umidade_baixa",
]


@router.get(
    "",
    response_model=list[Alerta],
    summary="Listar alertas com filtros",
)
async def listar_alertas(
    dispositivo_id: UUID | None = Query(default=None),
    tipo: TipoAlerta | None = Query(default=None),
    inicio: datetime | None = Query(default=None),
    fim: datetime | None = Query(default=None),
    limite: int = Query(default=200, ge=1, le=2000),
) -> list[dict]:
    supabase = get_supabase()
    query = supabase.table("alertas").select("*").order("registrado_em", desc=True)

    if dispositivo_id:
        query = query.eq("dispositivo_id", str(dispositivo_id))
    if tipo:
        query = query.eq("tipo", tipo)
    if inicio:
        query = query.gte("registrado_em", inicio.isoformat())
    if fim:
        query = query.lte("registrado_em", fim.isoformat())

    resposta = query.limit(limite).execute()
    return resposta.data or []


@router.get(
    "/recentes",
    response_model=list[Alerta],
    summary="Alertas das últimas N horas",
)
async def listar_alertas_recentes(
    horas: int = Query(default=24, ge=1, le=720),
) -> list[dict]:
    inicio = datetime.now(timezone.utc) - timedelta(hours=horas)
    supabase = get_supabase()
    resposta = (
        supabase.table("alertas")
        .select("*")
        .gte("registrado_em", inicio.isoformat())
        .order("registrado_em", desc=True)
        .limit(500)
        .execute()
    )
    return resposta.data or []
