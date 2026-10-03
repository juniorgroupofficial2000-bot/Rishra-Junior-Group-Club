import type { PujaLiveStatus } from "@/lib/puja/status";
import { liveStatusLabel } from "@/lib/puja/status";
import { cn } from "@/lib/cn";

const tones: Record<PujaLiveStatus, string> = {
  upcoming: "border-ink-200 bg-ink-50 text-ink-700",
  today: "border-marigold-400/50 bg-marigold-50 text-marigold-700",
  live: "border-alta-400/60 bg-alta-50 text-alta-700",
  completed: "border-lotus-100 bg-lotus-50 text-lotus-700",
};

export function PujaStatusBadge({
  status,
  className,
}: {
  status: PujaLiveStatus | null | undefined;
  className?: string;
}) {
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tones[status],
        className,
      )}
    >
      {status === "live" ? (
        <span
          className="size-1.5 animate-pulse rounded-full bg-alta-500"
          aria-hidden
        />
      ) : null}
      {liveStatusLabel(status)}
    </span>
  );
}
