import { createClient } from "@/lib/supabase/server";
import { AlertasCliente } from "./alertas-cliente";
import type { Dispositivo, Alerta } from "@/lib/types";

export const revalidate = 0;

async function carregarDados() {
  const supabase = createClient();

  const [dispResp, alertResp] = await Promise.all([
    supabase
      .from("vw_dispositivos_status")
      .select("*")
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("alertas")
      .select("*")
      .gte(
        "registrado_em",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("registrado_em", { ascending: false })
      .limit(500),
  ]);

  return {
    dispositivos: (dispResp.data ?? []) as Dispositivo[],
    alertas: (alertResp.data ?? []) as Alerta[],
  };
}

export default async function AlertasPage() {
  const dados = await carregarDados();
  return (
    <AlertasCliente
      dispositivosIniciais={dados.dispositivos}
      alertasIniciais={dados.alertas}
    />
  );
}
