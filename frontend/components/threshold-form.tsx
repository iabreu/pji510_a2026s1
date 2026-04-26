"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Dispositivo } from "@/lib/types";

interface ThresholdFormProps {
  dispositivo: Dispositivo;
}

export function ThresholdForm({ dispositivo }: ThresholdFormProps) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [valores, setValores] = useState({
    temperatura_min: dispositivo.temperatura_min,
    temperatura_max: dispositivo.temperatura_max,
    umidade_min: dispositivo.umidade_min,
    umidade_max: dispositivo.umidade_max,
    intervalo_offline_segundos: dispositivo.intervalo_offline_segundos,
  });

  const handleChange = (
    campo: keyof typeof valores,
    valor: string,
  ) => {
    setValores((v) => ({ ...v, [campo]: Number(valor) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem(null);
    setErro(null);

    if (valores.temperatura_min >= valores.temperatura_max) {
      setErro("Temperatura mínima deve ser menor que a máxima.");
      setSalvando(false);
      return;
    }
    if (valores.umidade_min >= valores.umidade_max) {
      setErro("Umidade mínima deve ser menor que a máxima.");
      setSalvando(false);
      return;
    }

    try {
      await api.atualizarLimites(dispositivo.id, valores);
      setMensagem("Limites atualizados com sucesso.");
      router.refresh();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Erro ao salvar. Verifique se o backend está acessível.",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites e configurações</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="text-sm font-medium mb-2 sm:col-span-2">
              Temperatura (°C)
            </legend>
            <div className="space-y-1.5">
              <Label htmlFor="temp-min">Mínima</Label>
              <Input
                id="temp-min"
                type="number"
                step="0.1"
                value={valores.temperatura_min}
                onChange={(e) => handleChange("temperatura_min", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp-max">Máxima</Label>
              <Input
                id="temp-max"
                type="number"
                step="0.1"
                value={valores.temperatura_max}
                onChange={(e) => handleChange("temperatura_max", e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="text-sm font-medium mb-2 sm:col-span-2">
              Umidade (%)
            </legend>
            <div className="space-y-1.5">
              <Label htmlFor="umid-min">Mínima</Label>
              <Input
                id="umid-min"
                type="number"
                step="0.1"
                value={valores.umidade_min}
                onChange={(e) => handleChange("umidade_min", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="umid-max">Máxima</Label>
              <Input
                id="umid-max"
                type="number"
                step="0.1"
                value={valores.umidade_max}
                onChange={(e) => handleChange("umidade_max", e.target.value)}
              />
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="offline">
              Tempo sem leitura para considerar offline (segundos)
            </Label>
            <Input
              id="offline"
              type="number"
              min={10}
              max={86400}
              value={valores.intervalo_offline_segundos}
              onChange={(e) =>
                handleChange("intervalo_offline_segundos", e.target.value)
              }
            />
            <p className="text-xs text-muted-foreground">
              O ESP32 envia leituras a cada 30 s; valores entre 60 e 300 são razoáveis.
            </p>
          </div>

          {erro && (
            <p className="text-sm text-destructive" role="alert">
              {erro}
            </p>
          )}
          {mensagem && (
            <p className="text-sm text-success" role="status">
              {mensagem}
            </p>
          )}

          <Button type="submit" disabled={salvando}>
            <Save className="h-4 w-4" />
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
