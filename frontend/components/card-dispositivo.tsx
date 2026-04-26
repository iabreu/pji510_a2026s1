"use client";

import Link from "next/link";
import { Thermometer, Droplets, MapPin, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  formatarTemperatura,
  formatarUmidade,
  formatarTempoRelativo,
  cn,
} from "@/lib/utils";
import type { Dispositivo } from "@/lib/types";

interface CardDispositivoProps {
  dispositivo: Dispositivo;
}

export function CardDispositivo({ dispositivo }: CardDispositivoProps) {
  const temperaturaForaLimite =
    dispositivo.ultima_temperatura !== null &&
    (dispositivo.ultima_temperatura < dispositivo.temperatura_min ||
      dispositivo.ultima_temperatura > dispositivo.temperatura_max);

  const umidadeForaLimite =
    dispositivo.ultima_umidade !== null &&
    (dispositivo.ultima_umidade < dispositivo.umidade_min ||
      dispositivo.ultima_umidade > dispositivo.umidade_max);

  return (
    <Link
      href={`/dispositivo/${dispositivo.id}`}
      className="block transition-transform hover:scale-[1.01]"
    >
      <Card className="h-full hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate">{dispositivo.nome}</CardTitle>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {dispositivo.localizacao}
              </p>
            </div>
            <StatusBadge status={dispositivo.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div
              className={cn(
                "rounded-md border p-3",
                temperaturaForaLimite && "border-destructive/50 bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" />
                Temperatura
              </div>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tabular-nums",
                  temperaturaForaLimite && "text-destructive",
                )}
              >
                {formatarTemperatura(dispositivo.ultima_temperatura)}
              </p>
              <p className="text-xs text-muted-foreground">
                {dispositivo.temperatura_min}° – {dispositivo.temperatura_max}°
              </p>
            </div>

            <div
              className={cn(
                "rounded-md border p-3",
                umidadeForaLimite && "border-destructive/50 bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                Umidade
              </div>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold tabular-nums",
                  umidadeForaLimite && "text-destructive",
                )}
              >
                {formatarUmidade(dispositivo.ultima_umidade)}
              </p>
              <p className="text-xs text-muted-foreground">
                {dispositivo.umidade_min}% – {dispositivo.umidade_max}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              Última leitura {formatarTempoRelativo(dispositivo.ultima_leitura_em)}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
