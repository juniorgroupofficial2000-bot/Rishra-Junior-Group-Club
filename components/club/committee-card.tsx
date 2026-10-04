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

/**
 * Compact committee summary card (design-system / admin previews).
 * Public pages should prefer `CommitteeMemberCard` with portrait slots.
 */
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
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink-900 font-display text-sm font-semibold text-marigold-400"
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
    <Card
      className={cn(
        "overflow-hidden border-border-subtle shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Initials label={nameText} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="type-caption text-alta-600">{role}</p>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-display text-xl">{name}</CardTitle>
            {tenureLabel ? <Badge variant="outline">{tenureLabel}</Badge> : null}
          </div>
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
