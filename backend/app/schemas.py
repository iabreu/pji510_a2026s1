"""Schemas Pydantic usados nas rotas da API."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# Leituras
# ============================================================================
class LeituraCriar(BaseModel):
    """Payload enviado pelo ESP32 ao registrar uma leitura."""

    temperatura: float = Field(..., ge=-50, le=100, description="Temperatura em °C")
    umidade: float = Field(..., ge=0, le=100, description="Umidade relativa em %")
    registrado_em: datetime | None = Field(
        default=None,
        description="Timestamp da leitura. Se omitido, usa NOW() do banco.",
    )


class Leitura(BaseModel):
    """Leitura como retornada pelo banco."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    dispositivo_id: UUID
    temperatura: float
    umidade: float
    registrado_em: datetime


# ============================================================================
# Dispositivos
# ============================================================================
class DispositivoStatus(BaseModel):
    """Dispositivo com status atual (vem da view vw_dispositivos_status)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    localizacao: str
    temperatura_min: float
    temperatura_max: float
    umidade_min: float
    umidade_max: float
    intervalo_offline_segundos: int
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime
    ultima_temperatura: float | None = None
    ultima_umidade: float | None = None
    ultima_leitura_em: datetime | None = None
    status: Literal["online", "offline"] = "offline"


class DispositivoAtualizarLimites(BaseModel):
    """Payload para atualizar os limites (thresholds) de um dispositivo."""

    temperatura_min: float | None = Field(default=None, ge=-50, le=100)
    temperatura_max: float | None = Field(default=None, ge=-50, le=100)
    umidade_min: float | None = Field(default=None, ge=0, le=100)
    umidade_max: float | None = Field(default=None, ge=0, le=100)
    intervalo_offline_segundos: int | None = Field(default=None, ge=10, le=86400)


# ============================================================================
# Alertas
# ============================================================================
class Alerta(BaseModel):
    """Alerta gerado quando uma leitura sai dos limites."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    dispositivo_id: UUID
    leitura_id: UUID
    tipo: Literal[
        "temperatura_alta", "temperatura_baixa",
        "umidade_alta", "umidade_baixa",
    ]
    valor_medido: float
    limite: float
    registrado_em: datetime


# ============================================================================
# Estatísticas
# ============================================================================
class Estatisticas(BaseModel):
    """Estatísticas agregadas de um período."""

    dispositivo_id: UUID
    inicio: datetime
    fim: datetime
    total_leituras: int
    temperatura_media: float | None = None
    temperatura_min: float | None = None
    temperatura_max: float | None = None
    umidade_media: float | None = None
    umidade_min: float | None = None
    umidade_max: float | None = None
    total_alertas: int = 0


# ============================================================================
# Health
# ============================================================================
class Health(BaseModel):
    status: Literal["ok", "degraded"]
    versao: str
    timestamp: datetime
