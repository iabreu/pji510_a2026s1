"use client";

import { useState, useMemo } from "react";
import { TabelaLeituras } from "@/components/tabela-leituras";
import { SeletorPeriodo } from "@/components/seletor-periodo";
import { useLeiturasPolling } from "@/lib/hooks";
import {
  PERIODO_HORAS,
  type Dispositivo,
  type Leitura,
  type PeriodoFiltro,
} from "@/lib/types";

interface Props {
  dispositivosIniciais: Dispositivo[];
  leiturasIniciais: Leitura[];
}

export function LeiturasCliente({
  dispositivosIniciais,
  leiturasIniciais,
}: Props) {
  const leituras = useLeiturasPolling(leiturasIniciais);
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");

  const limiteTimestamp = useMemo(
    () => Date.now() - PERIODO_HORAS[periodo] * 60 * 60 * 1000,
    [periodo],
  );

  const leiturasFiltradas = useMemo(
    () =>
      leituras.filter(
        (l) => new Date(l.registrado_em).getTime() >= limiteTimestamp,
      ),
    [leituras, limiteTimestamp],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leituras</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Histórico de leituras dos dispositivos. Filtre, ordene e exporte para CSV.
          </p>
        </div>
        <div className="w-44">
          <SeletorPeriodo valor={periodo} onChange={setPeriodo} />
        </div>
      </div>

      <TabelaLeituras
        leituras={leiturasFiltradas}
        dispositivos={dispositivosIniciais}
      />
    </div>
  );
}
