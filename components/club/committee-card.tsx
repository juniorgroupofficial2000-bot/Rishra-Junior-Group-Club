import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type CommitteeCardProps = {
  name: ReactNode;
  role: ReactNode;
  tenureLabel?: string;
  description?: ReactNode;
  className?: string;
};

/** Initials avatar — no invented photos. */
function Initials({ label }: { label: string }) {
  const initials = label
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-100 font-display text-sm font-semibold text-ink-800"
      aria-hidden
    >
      {initials || "—"}
    </div>
  );
}

export function CommitteeCard({
  name,
  role,
  tenureLabel,
  description,
  className,
}: CommitteeCardProps) {
  const nameText = typeof name === "string" ? name : "Member";

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Initials label={nameText} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">{name}</CardTitle>
            {tenureLabel ? <Badge variant="outline">{tenureLabel}</Badge> : null}
          </div>
          <p className="text-sm font-medium text-alta-600">{role}</p>
        </div>
      </CardHeader>
      {description ? (
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      ) : null}
    </Card>
  );
}
