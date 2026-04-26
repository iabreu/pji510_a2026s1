// Wrapper para chamadas ao backend FastAPI.
// Como o frontend já usa Supabase para leituras (via Realtime e queries diretas),
// só usamos o backend para operações que dependem de service_role ou para o
// PATCH de limites (que poderia ir direto via RLS authenticated, mas centralizamos
// aqui para manter a lógica do FastAPI como fonte de verdade).

import type { Estatisticas, Dispositivo } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!resp.ok) {
    const texto = await resp.text();
    throw new ApiError(resp.status, texto || resp.statusText);
  }
  return resp.json() as Promise<T>;
}

export const api = {
  estatisticas: (dispositivoId: string, horas = 24) =>
    fetchJSON<Estatisticas>(
      `/estatisticas/${dispositivoId}?horas=${horas}`,
    ),

  atualizarLimites: (
    dispositivoId: string,
    payload: Partial<{
      temperatura_min: number;
      temperatura_max: number;
      umidade_min: number;
      umidade_max: number;
      intervalo_offline_segundos: number;
    }>,
  ) =>
    fetchJSON<Dispositivo>(`/dispositivos/${dispositivoId}/limites`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
