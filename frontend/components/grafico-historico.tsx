"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from "recharts";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Leitura, Dispositivo } from "@/lib/types";

interface GraficoHistoricoProps {
  leituras: Leitura[];
  dispositivos: Dispositivo[];
  metrica: "temperatura" | "umidade";
  altura?: number;
}

// Paleta de cores (suficiente para vários dispositivos)
const CORES = [
  "#0ea5e9",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
];

export function GraficoHistorico({
  leituras,
  dispositivos,
  metrica,
  altura = 320,
}: GraficoHistoricoProps) {
  // Agrupar leituras por timestamp, com uma série por dispositivo.
  const dados = useMemo(() => {
    const mapa = new Map<string, Record<string, number | string>>();

    for (const l of leituras) {
      // Arredondar pra minuto para mesclar leituras próximas
      const t = l.registrado_em;
      if (!mapa.has(t)) {
        mapa.set(t, { timestamp: t });
      }
      const linha = mapa.get(t)!;
      linha[l.dispositivo_id] = l[metrica];
    }

    return Array.from(mapa.values()).sort(
      (a, b) =>
        new Date(a.timestamp as string).getTime() -
        new Date(b.timestamp as string).getTime(),
    );
  }, [leituras, metrica]);

  if (leituras.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground"
        style={{ height: altura }}
      >
        Sem leituras no período selecionado.
      </div>
    );
  }

  // Determinar limites a desenhar (se um único dispositivo, mostrar a faixa permitida)
  const dispositivoUnico = dispositivos.length === 1 ? dispositivos[0] : null;
  const min = dispositivoUnico
    ? metrica === "temperatura"
      ? dispositivoUnico.temperatura_min
      : dispositivoUnico.umidade_min
    : null;
  const max = dispositivoUnico
    ? metrica === "temperatura"
      ? dispositivoUnico.temperatura_max
      : dispositivoUnico.umidade_max
    : null;

  const unidade = metrica === "temperatura" ? "°C" : "%";

  return (
    <div style={{ width: "100%", height: altura }}>
      <ResponsiveContainer>
        <LineChart data={dados} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => {
              try {
                return format(parseISO(v), "dd/MM HH:mm", { locale: ptBR });
              } catch {
                return v;
              }
            }}
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `${v}${unidade}`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(v) => {
              try {
                return format(parseISO(v as string), "dd/MM/yyyy HH:mm:ss", {
                  locale: ptBR,
                });
              } catch {
                return v as string;
              }
            }}
            formatter={(valor: number, name: string) => {
              const disp = dispositivos.find((d) => d.id === name);
              return [
                `${valor.toFixed(1)}${unidade}`,
                disp?.nome || name,
              ];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => {
              const disp = dispositivos.find((d) => d.id === value);
              return disp?.nome || value;
            }}
          />

          {/* Faixa de limites (apenas com um dispositivo) */}
          {min !== null && max !== null && (
            <ReferenceArea
              y1={min}
              y2={max}
              fill="#10b981"
              fillOpacity={0.06}
              ifOverflow="extendDomain"
            />
          )}

          {dispositivos.map((d, i) => (
            <Line
              key={d.id}
              type="monotone"
              dataKey={d.id}
              stroke={CORES[i % CORES.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
              name={d.id}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
