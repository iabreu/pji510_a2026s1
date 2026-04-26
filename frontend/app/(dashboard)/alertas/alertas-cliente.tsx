"use client";

import { useState, useMemo } from "react";
import { ListaAlertas } from "@/components/lista-alertas";
import { SeletorPeriodo } from "@/components/seletor-periodo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useAlertasPolling } from "@/lib/hooks";
import {
  PERIODO_HORAS,
  TIPO_ALERTA_LABEL,
  type Alerta,
  type Dispositivo,
  type PeriodoFiltro,
  type TipoAlerta,
} from "@/lib/types";

interface Props {
  dispositivosIniciais: Dispositivo[];
  alertasIniciais: Alerta[];
}

export function AlertasCliente({
  dispositivosIniciais,
  alertasIniciais,
}: Props) {
  const alertas = useAlertasPolling(alertasIniciais);

  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");
  const [filtroDispositivo, setFiltroDispositivo] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const limiteTimestamp = useMemo(
    () => Date.now() - PERIODO_HORAS[periodo] * 60 * 60 * 1000,
    [periodo],
  );

  const alertasFiltrados = useMemo(() => {
    let r = alertas.filter(
      (a) => new Date(a.registrado_em).getTime() >= limiteTimestamp,
    );
    if (filtroDispositivo !== "todos") {
      r = r.filter((a) => a.dispositivo_id === filtroDispositivo);
    }
    if (filtroTipo !== "todos") {
      r = r.filter((a) => a.tipo === filtroTipo);
    }
    return r;
  }, [alertas, limiteTimestamp, filtroDispositivo, filtroTipo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Eventos disparados quando uma leitura sai dos limites configurados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Período
              </label>
              <SeletorPeriodo valor={periodo} onChange={setPeriodo} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Dispositivo
              </label>
              <Select
                value={filtroDispositivo}
                onChange={(e) => setFiltroDispositivo(e.target.value)}
              >
                <option value="todos">Todos</option>
                {dispositivosIniciais.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Tipo
              </label>
              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos</option>
                {(Object.keys(TIPO_ALERTA_LABEL) as TipoAlerta[]).map((t) => (
                  <option key={t} value={t}>
                    {TIPO_ALERTA_LABEL[t]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          {alertasFiltrados.length}{" "}
          {alertasFiltrados.length === 1 ? "alerta encontrado" : "alertas encontrados"}
        </p>
        <ListaAlertas
          alertas={alertasFiltrados}
          dispositivos={dispositivosIniciais}
        />
      </div>
    </div>
  );
}
