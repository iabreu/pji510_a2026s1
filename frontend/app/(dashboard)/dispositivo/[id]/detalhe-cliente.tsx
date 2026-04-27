"use client";

import { useState, useMemo } from "react";
import {
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraficoHistorico } from "@/components/grafico-historico";
import { ListaAlertas } from "@/components/lista-alertas";
import { ThresholdForm } from "@/components/threshold-form";
import { KpiCard } from "@/components/kpi-card";
import { SeletorPeriodo } from "@/components/seletor-periodo";
import { useLeiturasPolling, useAlertasPolling } from "@/lib/hooks";
import {
  formatarTemperatura,
  formatarUmidade,
  formatarTempoRelativo,
} from "@/lib/utils";
import {
  PERIODO_HORAS,
  type Alerta,
  type Dispositivo,
  type Leitura,
  type PeriodoFiltro,
} from "@/lib/types";

interface Props {
  dispositivoInicial: Dispositivo;
  leiturasIniciais: Leitura[];
  alertasIniciais: Alerta[];
}

export function DispositivoDetalheCliente({
  dispositivoInicial,
  leiturasIniciais,
  alertasIniciais,
}: Props) {
  const dispositivo = dispositivoInicial; // dados iniciais bastam pra detalhe
  const todasLeituras = useLeiturasPolling(leiturasIniciais);
  const todosAlertas = useAlertasPolling(alertasIniciais);

  // Filtrar pelo dispositivo
  const leiturasDoDispositivo = useMemo(
    () => todasLeituras.filter((l) => l.dispositivo_id === dispositivo.id),
    [todasLeituras, dispositivo.id],
  );
  const alertasDoDispositivo = useMemo(
    () => todosAlertas.filter((a) => a.dispositivo_id === dispositivo.id),
    [todosAlertas, dispositivo.id],
  );

  const [periodo, setPeriodo] = useState<PeriodoFiltro>("24h");
  const horasFiltro = PERIODO_HORAS[periodo];
  const limiteTimestamp = useMemo(
    () => Date.now() - horasFiltro * 60 * 60 * 1000,
    [horasFiltro],
  );

  const leiturasFiltradas = useMemo(
    () =>
      leiturasDoDispositivo.filter(
        (l) => new Date(l.registrado_em).getTime() >= limiteTimestamp,
      ),
    [leiturasDoDispositivo, limiteTimestamp],
  );

  const alertasFiltrados = useMemo(
    () =>
      alertasDoDispositivo.filter(
        (a) => new Date(a.registrado_em).getTime() >= limiteTimestamp,
      ),
    [alertasDoDispositivo, limiteTimestamp],
  );

  // Estatísticas do período (calculadas no cliente para reagir ao seletor)
  const estatisticas = useMemo(() => {
    if (leiturasFiltradas.length === 0) return null;
    const temps = leiturasFiltradas.map((l) => Number(l.temperatura));
    const umids = leiturasFiltradas.map((l) => Number(l.umidade));
    return {
      total: leiturasFiltradas.length,
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      tempMedia: temps.reduce((a, b) => a + b, 0) / temps.length,
      umidMin: Math.min(...umids),
      umidMax: Math.max(...umids),
      umidMedia: umids.reduce((a, b) => a + b, 0) / umids.length,
    };
  }, [leiturasFiltradas]);

  // Última leitura disponível do dispositivo
  const ultima = leiturasDoDispositivo[0];
  const tempAtual = ultima?.temperatura ?? dispositivo.ultima_temperatura;
  const umidAtual = ultima?.umidade ?? dispositivo.ultima_umidade;
  const ultimoTimestamp =
    ultima?.registrado_em ?? dispositivo.ultima_leitura_em;

  return (
    <>
      {/* KPIs atuais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="Temperatura atual"
          valor={formatarTemperatura(tempAtual)}
          icone={Thermometer}
          tom="default"
          descricao={`Limites: ${dispositivo.temperatura_min}° – ${dispositivo.temperatura_max}°`}
        />
        <KpiCard
          titulo="Umidade atual"
          valor={formatarUmidade(umidAtual)}
          icone={Droplets}
          tom="default"
          descricao={`Limites: ${dispositivo.umidade_min}% – ${dispositivo.umidade_max}%`}
        />
        <KpiCard
          titulo="Última leitura"
          valor={formatarTempoRelativo(ultimoTimestamp)}
          icone={Activity}
          tom="default"
        />
        <KpiCard
          titulo="Alertas no período"
          valor={String(alertasFiltrados.length)}
          icone={AlertTriangle}
          tom={alertasFiltrados.length > 0 ? "destructive" : "success"}
        />
      </div>

      {/* Período */}
      <div className="flex justify-end">
        <div className="w-44">
          <SeletorPeriodo valor={periodo} onChange={setPeriodo} />
        </div>
      </div>

      {/* Estatísticas do período */}
      {estatisticas && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Temperatura
                </p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Média</dt>
                    <dd className="font-mono tabular-nums">
                      {formatarTemperatura(estatisticas.tempMedia)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Mínima</dt>
                    <dd className="font-mono tabular-nums">
                      {formatarTemperatura(estatisticas.tempMin)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Máxima</dt>
                    <dd className="font-mono tabular-nums">
                      {formatarTemperatura(estatisticas.tempMax)}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Umidade
                </p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Média</dt>
                    <dd className="font-mono tabular-nums">
                      {formatarUmidade(estatisticas.umidMedia)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Mínima</dt>
                    <dd className="font-mono tabular-nums">
                      {formatarUmidade(estatisticas.umidMin)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Máxima</dt>
                    <dd className="font-mono tabular-nums">
                      {formatarUmidade(estatisticas.umidMax)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Baseado em {estatisticas.total.toLocaleString("pt-BR")} leituras.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de temperatura */}
      <Card>
        <CardHeader>
          <CardTitle>Temperatura</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoHistorico
            leituras={leiturasFiltradas}
            dispositivos={[dispositivo]}
            metrica="temperatura"
            altura={280}
          />
        </CardContent>
      </Card>

      {/* Gráfico de umidade */}
      <Card>
        <CardHeader>
          <CardTitle>Umidade</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoHistorico
            leituras={leiturasFiltradas}
            dispositivos={[dispositivo]}
            metrica="umidade"
            altura={280}
          />
        </CardContent>
      </Card>

      {/* Form de limites */}
      <ThresholdForm dispositivo={dispositivo} />

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <ListaAlertas
            alertas={alertasFiltrados}
            dispositivos={[dispositivo]}
          />
        </CardContent>
      </Card>
    </>
  );
}
