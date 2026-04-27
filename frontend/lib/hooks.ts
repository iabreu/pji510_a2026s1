"use client";

import { useEffect, useRef, useState } from "react";
import type { Leitura, Alerta, Dispositivo } from "@/lib/types";

export function useLeiturasPolling(iniciais: Leitura[], intervaloMs = 5_000) {
  const [leituras, setLeituras] = useState<Leitura[]>(iniciais);
  const ultimaDataRef = useRef<string | null>(null);

  useEffect(() => {
    setLeituras(iniciais);
    ultimaDataRef.current = iniciais[0]?.registrado_em ?? null;
  }, [iniciais]);

  useEffect(() => {
    const id = setInterval(async () => {
      const desde = ultimaDataRef.current;
      if (!desde) return;

      try {
        const resp = await fetch(`/api/leituras?desde=${encodeURIComponent(desde)}&limite=100`);
        if (!resp.ok) return;
        const data = await resp.json() as Leitura[];

        if (data.length > 0) {
          ultimaDataRef.current = data[0].registrado_em;
          setLeituras((atuais) => {
            const ids = new Set(atuais.map((l) => l.id));
            const unicas = data.filter((l) => !ids.has(l.id));
            return [...unicas, ...atuais].slice(0, 5000);
          });
        }
      } catch {
        // falha silenciosa, tenta de novo no próximo intervalo
      }
    }, intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return leituras;
}

export function useAlertasPolling(iniciais: Alerta[], intervaloMs = 5_000) {
  const [alertas, setAlertas] = useState<Alerta[]>(iniciais);
  const ultimaDataRef = useRef<string | null>(null);

  useEffect(() => {
    setAlertas(iniciais);
    ultimaDataRef.current = iniciais[0]?.registrado_em ?? null;
  }, [iniciais]);

  useEffect(() => {
    const id = setInterval(async () => {
      const desde = ultimaDataRef.current;
      if (!desde) return;

      try {
        const resp = await fetch(`/api/alertas?desde=${encodeURIComponent(desde)}`);
        if (!resp.ok) return;
        const data = await resp.json() as Alerta[];

        if (data.length > 0) {
          ultimaDataRef.current = data[0].registrado_em;
          setAlertas((atuais) => {
            const ids = new Set(atuais.map((a) => a.id));
            const unicos = data.filter((a) => !ids.has(a.id));
            return [...unicos, ...atuais].slice(0, 500);
          });
        }
      } catch {
        // falha silenciosa
      }
    }, intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return alertas;
}

export function useDispositivosPolling(iniciais: Dispositivo[], intervaloMs = 5_000) {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>(iniciais);

  useEffect(() => {
    setDispositivos(iniciais);
  }, [iniciais]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const resp = await fetch("/api/dispositivos");
        if (!resp.ok) return;
        const data = await resp.json() as Dispositivo[];
        setDispositivos(data);
      } catch {
        // falha silenciosa
      }
    }, intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return dispositivos;
}
