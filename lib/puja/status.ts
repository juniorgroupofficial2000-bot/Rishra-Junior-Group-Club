export type PujaLiveStatus = "upcoming" | "today" | "live" | "completed";

export function computeLiveStatus(
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined,
  now = new Date(),
): PujaLiveStatus | null {
  if (!startsAt) return null;
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  if (Number.isNaN(start.getTime())) return null;
  const end = endsAt
    ? typeof endsAt === "string"
      ? new Date(endsAt)
      : endsAt
    : null;
  const endTime =
    end && !Number.isNaN(end.getTime())
      ? end.getTime()
      : start.getTime() + 2 * 60 * 60_000;

  const t = now.getTime();
  if (t > endTime) return "completed";
  if (t >= start.getTime() && t <= endTime) return "live";

  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const endDay = new Date(endTime);
  endDay.setHours(23, 59, 59, 999);
  if (t >= startDay.getTime() && t <= endDay.getTime()) return "today";

  return "upcoming";
}

export function liveStatusLabel(status: PujaLiveStatus): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "today":
      return "Today";
    case "live":
      return "Live";
    case "completed":
      return "Completed";
  }
}

export const PUJA_STAGE_LABELS: Record<string, string> = {
  PREPARATION: "Preparation",
  DECORATION: "Decoration",
  PUJA: "Puja",
  PUSHPANJALI: "Pushpanjali",
  CULTURAL: "Cultural Program",
  PRASAD: "Prasad",
  IMMERSION: "Immersion",
  OTHER: "Programme",
};
