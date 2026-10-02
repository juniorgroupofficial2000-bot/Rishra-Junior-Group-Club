import { cn } from "@/lib/cn";

export type BarDatum = {
  label: string;
  value: number;
};

/** Lightweight accessible bar chart — no client chart library required. */
export function SimpleBarChart({
  data,
  className,
  valueFormatter,
}: {
  data: BarDatum[];
  className?: string;
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const format = valueFormatter ?? ((value: number) => String(value));

  return (
    <ul className={cn("space-y-3", className)} aria-label="Bar chart">
      {data.map((item) => {
        const width = Math.round((item.value / max) * 100);
        return (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink-800">{item.label}</span>
              <span className="font-mono text-xs text-ink-500">
                {format(item.value)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-ink-800 transition-[width] duration-500"
                style={{ width: `${width}%` }}
                title={format(item.value)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
