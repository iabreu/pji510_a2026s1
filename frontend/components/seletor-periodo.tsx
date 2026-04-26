"use client";

import { Select } from "@/components/ui/select";
import { PERIODO_LABEL, type PeriodoFiltro } from "@/lib/types";

interface SeletorPeriodoProps {
  valor: PeriodoFiltro;
  onChange: (v: PeriodoFiltro) => void;
}

export function SeletorPeriodo({ valor, onChange }: SeletorPeriodoProps) {
  return (
    <Select
      value={valor}
      onChange={(e) => onChange(e.target.value as PeriodoFiltro)}
      aria-label="Período"
    >
      {Object.entries(PERIODO_LABEL).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </Select>
  );
}
