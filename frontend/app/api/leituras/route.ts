import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const desde = request.nextUrl.searchParams.get("desde");
  const limite = Number(request.nextUrl.searchParams.get("limite") || "100");

  let query = supabase
    .from("leituras")
    .select("*")
    .order("registrado_em", { ascending: false })
    .limit(Math.min(limite, 5000));

  if (desde) {
    query = query.gt("registrado_em", desde);
  } else {
    const inicio = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("registrado_em", inicio);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
