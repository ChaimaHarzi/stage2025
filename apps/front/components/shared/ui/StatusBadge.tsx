import { STATUS_INFO, type Status } from "@/lib/config";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status, large = false }: { status: Status; large?: boolean }) {
  const info = STATUS_INFO[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ring-1 ring-inset",
        info.badge,
        large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", info.dot)} />
      {info.label}
    </span>
  );
}
