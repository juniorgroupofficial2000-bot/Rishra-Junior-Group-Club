import { describe, expect, it } from "vitest";
import { computeLiveStatus, liveStatusLabel } from "@/lib/puja/status";

describe("puja live status", () => {
  it("returns null without a start time", () => {
    expect(computeLiveStatus(null, null)).toBeNull();
  });

  it("marks a future window as upcoming", () => {
    const now = new Date("2026-01-01T10:00:00.000Z");
    expect(
      computeLiveStatus(
        "2026-02-01T09:00:00.000Z",
        "2026-02-01T18:00:00.000Z",
        now,
      ),
    ).toBe("upcoming");
  });

  it("marks an active window as live", () => {
    const now = new Date("2026-02-01T12:00:00.000Z");
    expect(
      computeLiveStatus(
        "2026-02-01T09:00:00.000Z",
        "2026-02-01T18:00:00.000Z",
        now,
      ),
    ).toBe("live");
  });

  it("marks a past window as completed", () => {
    const now = new Date("2026-02-02T10:00:00.000Z");
    expect(
      computeLiveStatus(
        "2026-02-01T09:00:00.000Z",
        "2026-02-01T18:00:00.000Z",
        now,
      ),
    ).toBe("completed");
  });

  it("labels statuses for display", () => {
    expect(liveStatusLabel("live")).toBe("Live");
    expect(liveStatusLabel("today")).toBe("Today");
  });
});
