"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  baixarArquivo,
  cn,
  formatarDataHora,
  formatarTemperatura,
  formatarUmidade,
  gerarCSV,
} from "@/lib/utils";
import type { Leitura, Dispositivo } from "@/lib/types";

interface TabelaLeiturasProps {
  leituras: Leitura[];
  dispositivos: Dispositivo[];
}

const POR_PAGINA_OPTIONS = [25, 50, 100, 200];

export function TabelaLeituras({ leituras, dispositivos }: TabelaLeiturasProps) {
  const [filtroDispositivo, setFiltroDispositivo] = useState<string>("todos");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(50);

  const dispositivoMap = useMemo(
    () => Object.fromEntries(dispositivos.map((d) => [d.id, d])),
    [dispositivos],
  );

  const filtradas = useMemo(() => {
    let r = leituras;
    if (filtroDispositivo !== "todos") {
      r = r.filter((l) => l.dispositivo_id === filtroDispositivo);
    }
    return r;
  }, [leituras, filtroDispositivo]);

  const total = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const fim = inicio + porPagina;
  const visiveis = filtradas.slice(inicio, fim);

  const exportarCSV = () => {
    const csv = gerarCSV(filtradas, [
      { chave: "registrado_em", cabecalho: "Data/hora" },
      { chave: "dispositivo_id", cabecalho: "Dispositivo" },
      { chave: "temperatura", cabecalho: "Temperatura (°C)" },
      { chave: "umidade", cabecalho: "Umidade (%)" },
    ]);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    baixarArquivo(csv, `leituras-${stamp}.csv`, "text/csv;charset=utf-8");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>Leituras</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filtroDispositivo}
            onChange={(e) => {
              setFiltroDispositivo(e.target.value);
              setPagina(1);
            }}
            className="w-auto"
          >
            <option value="todos">Todos os dispositivos</option>
            {dispositivos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            disabled={total === 0}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/hora</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead className="text-right">Temperatura</TableHead>
              <TableHead className="text-right">Umidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiveis.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  Nenhuma leitura encontrada.
                </TableCell>
              </TableRow>
            ) : (
              visiveis.map((l) => {
                const d = dispositivoMap[l.dispositivo_id];
                const tempForaLimite =
                  d &&
                  (l.temperatura < d.temperatura_min ||
                    l.temperatura > d.temperatura_max);
                const umidForaLimite =
                  d &&
                  (l.umidade < d.umidade_min || l.umidade > d.umidade_max);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">
                      {formatarDataHora(l.registrado_em)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {d?.nome ?? l.dispositivo_id}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        tempForaLimite && "text-destructive font-semibold",
                      )}
                    >
                      {formatarTemperatura(l.temperatura)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        umidForaLimite && "text-destructive font-semibold",
                      )}
                    >
                      {formatarUmidade(l.umidade)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {total === 0
              ? "0 leituras"
              : `Mostrando ${inicio + 1}–${Math.min(fim, total)} de ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={String(porPagina)}
              onChange={(e) => {
                setPorPagina(Number(e.target.value));
                setPagina(1);
              }}
              className="w-auto"
            >
              {POR_PAGINA_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} por página
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaSegura <= 1}
            >
              Anterior
            </Button>
            <span className="tabular-nums">
              {paginaSegura} / {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaSegura >= totalPaginas}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
