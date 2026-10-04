import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type MemberCardProps = {
  name: ReactNode;
  membershipId?: string;
  status?: "active" | "pending" | "inactive";
  sinceLabel?: string;
  className?: string;
};

const statusVariant = {
  active: "success",
  pending: "warning",
  inactive: "neutral",
} as const;

const statusLabel = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
} as const;

export function MemberCard({
  name,
  membershipId,
  status = "active",
  sinceLabel,
  className,
}: MemberCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
        <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-ink-500">
        {membershipId ? (
          <p>
            ID{" "}
            <span className="font-mono text-ink-800">{membershipId}</span>
          </p>
        ) : null}
        {sinceLabel ? <p>Member since {sinceLabel}</p> : null}
      </CardContent>
    </Card>
  );
}
