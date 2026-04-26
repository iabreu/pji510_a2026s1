"""Rotas de dispositivos: listar, detalhar e atualizar limites."""
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.schemas import DispositivoAtualizarLimites, DispositivoStatus
from app.supabase_client import get_supabase

router = APIRouter(prefix="/dispositivos", tags=["dispositivos"])


@router.get(
    "",
    response_model=list[DispositivoStatus],
    summary="Listar todos os dispositivos com status atual",
)
async def listar_dispositivos() -> list[dict]:
    """Retorna todos os dispositivos ativos via view `vw_dispositivos_status`."""
    supabase = get_supabase()
    resposta = (
        supabase.table("vw_dispositivos_status")
        .select("*")
        .eq("ativo", True)
        .order("nome")
        .execute()
    )
    return resposta.data or []


@router.get(
    "/{dispositivo_id}",
    response_model=DispositivoStatus,
    summary="Detalhar um dispositivo",
)
async def detalhar_dispositivo(dispositivo_id: UUID) -> dict:
    supabase = get_supabase()
    resposta = (
        supabase.table("vw_dispositivos_status")
        .select("*")
        .eq("id", str(dispositivo_id))
        .limit(1)
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo não encontrado",
        )
    return resposta.data[0]


@router.patch(
    "/{dispositivo_id}/limites",
    response_model=DispositivoStatus,
    summary="Atualizar limites (thresholds) e intervalo offline",
)
async def atualizar_limites(
    dispositivo_id: UUID,
    payload: DispositivoAtualizarLimites,
) -> dict:
    """Atualiza apenas os campos enviados (PATCH parcial)."""
    dados = payload.model_dump(exclude_none=True)
    if not dados:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum campo enviado para atualizar",
        )

    supabase = get_supabase()
    resposta = (
        supabase.table("dispositivos")
        .update(dados)
        .eq("id", str(dispositivo_id))
        .execute()
    )
    if not resposta.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo não encontrado",
        )

    # Retornar a versão da view (com status atual)
    return await detalhar_dispositivo(dispositivo_id)
