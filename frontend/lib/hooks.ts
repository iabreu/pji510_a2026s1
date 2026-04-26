"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Leitura, Alerta, Dispositivo } from "@/lib/types";

export function useLeiturasPolling(iniciais: Leitura[], intervaloMs = 5_000) {
  const [leituras, setLeituras] = useState<Leitura[]>(iniciais);

  useEffect(() => {
    setLeituras(iniciais);
  }, [iniciais]);

  useEffect(() => {
    const supabase = createClient();
    const id = setInterval(async () => {
      const agora = new Date();
      const inicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("leituras")
        .select("*")
        .gte("registrado_em", inicio)
        .order("registrado_em", { ascending: false })
        .limit(5000);
      if (data) setLeituras(data as Leitura[]);
    }, intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return leituras;
}

export function useAlertasPolling(iniciais: Alerta[], intervaloMs = 5_000) {
  const [alertas, setAlertas] = useState<Alerta[]>(iniciais);

  useEffect(() => {
    setAlertas(iniciais);
  }, [iniciais]);

  useEffect(() => {
    const supabase = createClient();
    const id = setInterval(async () => {
      const agora = new Date();
      const inicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("alertas")
        .select("*")
        .gte("criado_em", inicio)
        .order("criado_em", { ascending: false })
        .limit(500);
      if (data) setAlertas(data as Alerta[]);
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
