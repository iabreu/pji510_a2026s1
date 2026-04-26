import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { DispositivoDetalheCliente } from "./detalhe-cliente";
import type { Dispositivo, Leitura, Alerta } from "@/lib/types";

export const revalidate = 0;

async function carregarDados(id: string) {
  const supabase = createClient();

  const [dispResp, leitResp, alertResp] = await Promise.all([
    supabase
      .from("vw_dispositivos_status")
      .select("*")
      .eq("id", id)
      .limit(1)
      .single(),
    supabase
      .from("leituras")
      .select("*")
      .eq("dispositivo_id", id)
      .gte(
        "registrado_em",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("registrado_em", { ascending: false })
      .limit(5000),
    supabase
      .from("alertas")
      .select("*")
      .eq("dispositivo_id", id)
      .order("registrado_em", { ascending: false })
      .limit(50),
  ]);

  if (dispResp.error || !dispResp.data) return null;

  return {
    dispositivo: dispResp.data as Dispositivo,
    leituras: (leitResp.data ?? []) as Leitura[],
    alertas: (alertResp.data ?? []) as Alerta[],
  };
}

export default async function DispositivoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const dados = await carregarDados(params.id);
  if (!dados) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {dados.dispositivo.nome}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {dados.dispositivo.localizacao}
          </p>
        </div>
        <StatusBadge status={dados.dispositivo.status} />
      </div>

      <DispositivoDetalheCliente
        dispositivoInicial={dados.dispositivo}
        leiturasIniciais={dados.leituras}
        alertasIniciais={dados.alertas}
      />
    </div>
  );
}
