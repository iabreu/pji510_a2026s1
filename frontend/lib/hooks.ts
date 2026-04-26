"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Leitura, Alerta, Dispositivo } from "@/lib/types";

/** Inscrição no Realtime do Supabase para acompanhar novas leituras. */
export function useLeiturasRealtime(iniciais: Leitura[]) {
  const [leituras, setLeituras] = useState<Leitura[]>(iniciais);

  useEffect(() => {
    setLeituras(iniciais);
  }, [iniciais]);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel("leituras-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leituras" },
        (payload) => {
          setLeituras((atuais) => {
            const nova = payload.new as Leitura;
            // Evitar duplicatas (caso o INSERT já tenha vindo na lista inicial)
            if (atuais.some((l) => l.id === nova.id)) return atuais;
            return [nova, ...atuais].slice(0, 5000);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return leituras;
}

/** Inscrição no Realtime do Supabase para acompanhar novos alertas. */
export function useAlertasRealtime(iniciais: Alerta[]) {
  const [alertas, setAlertas] = useState<Alerta[]>(iniciais);

  useEffect(() => {
    setAlertas(iniciais);
  }, [iniciais]);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel("alertas-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alertas" },
        (payload) => {
          setAlertas((atuais) => {
            const novo = payload.new as Alerta;
            if (atuais.some((a) => a.id === novo.id)) return atuais;
            return [novo, ...atuais].slice(0, 500);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return alertas;
}

/** Recarrega periodicamente os dispositivos (status online/offline). */
export function useDispositivosPolling(iniciais: Dispositivo[], intervaloMs = 30_000) {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>(iniciais);

  useEffect(() => {
    setDispositivos(iniciais);
  }, [iniciais]);

  useEffect(() => {
    const supabase = createClient();
    const id = setInterval(async () => {
      const { data } = await supabase
        .from("vw_dispositivos_status")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (data) setDispositivos(data as Dispositivo[]);
    }, intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return dispositivos;
}
