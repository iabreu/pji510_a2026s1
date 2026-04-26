import { Badge } from "@/components/ui/badge";
import type { StatusDispositivo } from "@/lib/types";

export function StatusBadge({ status }: { status: StatusDispositivo }) {
  if (status === "online") {
    return (
      <Badge variant="success">
        <span className="mr-1.5 h-2 w-2 rounded-full bg-current animate-pulse" />
        Online
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <span className="mr-1.5 h-2 w-2 rounded-full bg-muted-foreground" />
      Offline
    </Badge>
  );
}
