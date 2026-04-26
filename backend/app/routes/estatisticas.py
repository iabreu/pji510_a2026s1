"""Rotas de estatísticas: agregações por dispositivo e período."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas import Estatisticas
from app.supabase_client import get_supabase

router = APIRouter(prefix="/estatisticas", tags=["estatisticas"])


@router.get(
    "/{dispositivo_id}",
    response_model=Estatisticas,
    summary="Estatísticas agregadas de um dispositivo no período",
)
async def estatisticas_dispositivo(
    dispositivo_id: UUID,
    horas: int = Query(default=24, ge=1, le=720, description="Janela em horas"),
) -> Estatisticas:
    """Calcula min/max/média de temperatura e umidade + total de leituras e alertas."""
    inicio = datetime.now(timezone.utc) - timedelta(hours=horas)
    fim = datetime.now(timezone.utc)

    supabase = get_supabase()

    leituras = (
        supabase.table("leituras")
        .select("temperatura, umidade")
        .eq("dispositivo_id", str(dispositivo_id))
        .gte("registrado_em", inicio.isoformat())
        .lte("registrado_em", fim.isoformat())
        .limit(50000)
        .execute()
        .data
        or []
    )

    alertas = (
        supabase.table("alertas")
        .select("id", count="exact")
        .eq("dispositivo_id", str(dispositivo_id))
        .gte("registrado_em", inicio.isoformat())
        .lte("registrado_em", fim.isoformat())
        .execute()
    )
    total_alertas = alertas.count or 0

    if not leituras:
        return Estatisticas(
            dispositivo_id=dispositivo_id,
            inicio=inicio,
            fim=fim,
            total_leituras=0,
            total_alertas=total_alertas,
        )

    temperaturas = [float(l["temperatura"]) for l in leituras]
    umidades = [float(l["umidade"]) for l in leituras]

    return Estatisticas(
        dispositivo_id=dispositivo_id,
        inicio=inicio,
        fim=fim,
        total_leituras=len(leituras),
        temperatura_media=round(sum(temperaturas) / len(temperaturas), 2),
        temperatura_min=round(min(temperaturas), 2),
        temperatura_max=round(max(temperaturas), 2),
        umidade_media=round(sum(umidades) / len(umidades), 2),
        umidade_min=round(min(umidades), 2),
        umidade_max=round(max(umidades), 2),
        total_alertas=total_alertas,
    )
