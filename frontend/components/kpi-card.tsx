import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  titulo: string;
  valor: string;
  descricao?: string;
  icone: LucideIcon;
  tom?: "default" | "success" | "warning" | "destructive";
}

const tomClasses = {
  default: "text-muted-foreground bg-muted",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
};

export function KpiCard({
  titulo,
  valor,
  descricao,
  icone: Icone,
  tom = "default",
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            tomClasses[tom],
          )}
        >
          <Icone className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {titulo}
          </p>
          <p className="text-2xl font-bold tabular-nums">{valor}</p>
          {descricao && (
            <p className="text-xs text-muted-foreground truncate">{descricao}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
