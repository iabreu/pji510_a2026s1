import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatarDataCurta(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd/MM HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatarTempoRelativo(iso: string | null | undefined): string {
  if (!iso) return "nunca";
  try {
    return formatDistanceToNow(parseISO(iso), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return "—";
  }
}

export function formatarNumero(
  v: number | null | undefined,
  casas = 1,
): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toFixed(casas).replace(".", ",");
}

export function formatarTemperatura(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${formatarNumero(v)}°C`;
}

export function formatarUmidade(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${formatarNumero(v)}%`;
}

export function gerarCSV<T>(
  linhas: T[],
  colunas: { chave: keyof T & string; cabecalho: string }[],
): string {
  const cabecalho = colunas.map((c) => c.cabecalho).join(",");
  const corpo = linhas
    .map((linha) =>
      colunas
        .map((c) => {
          const valor = linha[c.chave as keyof T];
          if (valor === null || valor === undefined) return "";
          const s = String(valor);
          // escapar aspas e vírgulas
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(","),
    )
    .join("\n");
  return `${cabecalho}\n${corpo}`;
}

export function baixarArquivo(conteudo: string, nome: string, mime: string) {
  const blob = new Blob([conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
