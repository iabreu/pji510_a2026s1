import { createClient } from "@/lib/supabase/server";
import { DashboardCliente } from "./dashboard-cliente";
import type { Dispositivo, Leitura, Alerta } from "@/lib/types";

export const revalidate = 0; // sempre fresh

async function carregarDados() {
  const supabase = createClient();

  const [dispResp, leitResp, alertResp] = await Promise.all([
    supabase
      .from("vw_dispositivos_status")
      .select("*")
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("leituras")
      .select("*")
      .gte(
        "registrado_em",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("registrado_em", { ascending: false })
      .limit(5000),
    supabase
      .from("alertas")
      .select("*")
      .gte(
        "registrado_em",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("registrado_em", { ascending: false })
      .limit(20),
  ]);

  return {
    dispositivos: (dispResp.data ?? []) as Dispositivo[],
    leituras: (leitResp.data ?? []) as Leitura[],
    alertas: (alertResp.data ?? []) as Alerta[],
  };
}

export default async function DashboardPage() {
  const dados = await carregarDados();
  return (
    <DashboardCliente
      dispositivosIniciais={dados.dispositivos}
      leiturasIniciais={dados.leituras}
      alertasIniciais={dados.alertas}
    />
  );
}
