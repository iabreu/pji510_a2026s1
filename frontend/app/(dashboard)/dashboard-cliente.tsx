"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Cpu,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardDispositivo } from "@/components/card-dispositivo";
import { GraficoHistorico } from "@/components/grafico-historico";
import { ListaAlertas } from "@/components/lista-alertas";
import { KpiCard } from "@/components/kpi-card";
import { SeletorPeriodo } from "@/components/seletor-periodo";
import {
  useLeiturasRealtime,
  useAlertasRealtime,
  useDispositivosPolling,
} from "@/lib/hooks";
import {
  PERIODO_HORAS,
  type Alerta,
  type Dispositivo,
  type Leitura,
  type PeriodoFiltro,
} from "@/lib/types";

interface Props {
  dispositivosIniciais: Dispositivo[];
  leiturasIniciais: Leitura[];
  alertasIniciais: Alerta[];
}

export function DashboardCliente({
  dispositivosIniciais,
  leiturasIniciais,
  alertasIniciais,
}: Props) {
  const dispositivos = useDispositivosPolling(dispositivosIniciais);
  const leituras = useLeiturasRealtime(leiturasIniciais);
  const alertas = useAlertasRealtime(alertasIniciais);

  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");
  const [metrica, setMetrica] = useState<"temperatura" | "umidade">(
    "temperatura",
  );

  const horasFiltro = PERIODO_HORAS[periodo];
  const limiteTimestamp = useMemo(
    () => Date.now() - horasFiltro * 60 * 60 * 1000,
    [horasFiltro],
  );

  const leiturasFiltradas = useMemo(
    () =>
      leituras.filter(
        (l) => new Date(l.registrado_em).getTime() >= limiteTimestamp,
      ),
    [leituras, limiteTimestamp],
  );

  const alertasFiltrados = useMemo(
    () =>
      alertas.filter(
        (a) => new Date(a.registrado_em).getTime() >= limiteTimestamp,
      ),
    [alertas, limiteTimestamp],
  );

  const totalOnline = dispositivos.filter((d) => d.status === "online").length;
  const totalAlertas = alertasFiltrados.length;
  const totalLeituras = leiturasFiltradas.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe em tempo real as leituras dos dispositivos.
          </p>
        </div>
        <div className="w-44">
          <SeletorPeriodo valor={periodo} onChange={setPeriodo} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Dispositivos"
          valor={`${totalOnline} / ${dispositivos.length}`}
          descricao="online no momento"
          icone={Cpu}
          tom="default"
        />
        <KpiCard
          titulo="Leituras no período"
          valor={String(totalLeituras)}
          icone={Activity}
          tom="default"
        />
        <KpiCard
          titulo="Alertas no período"
          valor={String(totalAlertas)}
          icone={AlertTriangle}
          tom={totalAlertas > 0 ? "destructive" : "success"}
        />
        <KpiCard
          titulo="Atualização"
          valor="ao vivo"
          descricao="via Supabase Realtime"
          icone={Wifi}
          tom="success"
        />
      </div>

      {/* Cards dos dispositivos */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Dispositivos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dispositivos.map((d) => (
            <CardDispositivo key={d.id} dispositivo={d} />
          ))}
        </div>
      </section>

      {/* Gráfico comparativo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>
            Comparação de {metrica === "temperatura" ? "temperatura" : "umidade"}
          </CardTitle>
          <div className="flex gap-1 rounded-md bg-muted p-1 text-sm">
            <button
              onClick={() => setMetrica("temperatura")}
              className={`rounded px-3 py-1 ${
                metrica === "temperatura"
                  ? "bg-background shadow"
                  : "text-muted-foreground"
              }`}
            >
              Temperatura
            </button>
            <button
              onClick={() => setMetrica("umidade")}
              className={`rounded px-3 py-1 ${
                metrica === "umidade"
                  ? "bg-background shadow"
                  : "text-muted-foreground"
              }`}
            >
              Umidade
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <GraficoHistorico
            leituras={leiturasFiltradas}
            dispositivos={dispositivos}
            metrica={metrica}
            altura={360}
          />
        </CardContent>
      </Card>

      {/* Alertas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ListaAlertas
            alertas={alertasFiltrados.slice(0, 10)}
            dispositivos={dispositivos}
          />
        </CardContent>
      </Card>
    </div>
  );
}
