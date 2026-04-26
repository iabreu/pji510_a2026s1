import { createClient } from "@/lib/supabase/server";
import { LeiturasCliente } from "./leituras-cliente";
import type { Dispositivo, Leitura } from "@/lib/types";

export const revalidate = 0;

async function carregarDados() {
  const supabase = createClient();

  const [dispResp, leitResp] = await Promise.all([
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
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("registrado_em", { ascending: false })
      .limit(5000),
  ]);

  return {
    dispositivos: (dispResp.data ?? []) as Dispositivo[],
    leituras: (leitResp.data ?? []) as Leitura[],
  };
}

export default async function LeiturasPage() {
  const dados = await carregarDados();
  return (
    <LeiturasCliente
      dispositivosIniciais={dados.dispositivos}
      leiturasIniciais={dados.leituras}
    />
  );
}
