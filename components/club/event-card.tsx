import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type EventCardProps = {
  title: ReactNode;
  dateLabel: string;
  locationLabel?: string;
  description?: ReactNode;
  status?: "upcoming" | "ongoing" | "past";
  href?: string;
  className?: string;
};

const statusVariant = {
  upcoming: "heritage",
  ongoing: "accent",
  past: "neutral",
} as const;

const statusLabel = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  past: "Past",
} as const;

export function EventCard({
  title,
  dateLabel,
  locationLabel,
  description,
  status = "upcoming",
  href,
  className,
}: EventCardProps) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        </div>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="mt-auto space-y-2">
        <p className="flex items-center gap-2 text-sm text-ink-600">
          <CalendarDays className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          <time>{dateLabel}</time>
        </p>
        {locationLabel ? (
          <p className="flex items-center gap-2 text-sm text-ink-600">
            <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            <span>{locationLabel}</span>
          </p>
        ) : null}
      </CardContent>
      {href ? (
        <CardFooter>
          <Link
            href={href}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border-default px-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50 sm:w-auto"
          >
            View details
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
