"use client";

import { cn } from "@/lib/cn";
import { useState } from "react";

const tabs = [
  "Profile",
  "Membership",
  "Payments",
  "Attendance",
  "Events",
  "Documents",
  "Activity",
  "Card",
] as const;

export type MemberDetailTab = (typeof tabs)[number];

export function MemberDetailTabs({
  panels,
}: {
  panels: Record<MemberDetailTab, React.ReactNode>;
}) {
  const [active, setActive] = useState<MemberDetailTab>("Profile");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Member sections"
        className="flex gap-1 overflow-x-auto border-b border-border-subtle pb-px"
      >
        {tabs.map((tab) => {
          const selected = tab === active;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`member-tab-${tab}`}
              className={cn(
                "min-h-11 shrink-0 rounded-t-md px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border border-b-transparent border-border-subtle bg-surface-raised text-ink-900"
                  : "text-ink-500 hover:text-ink-800",
              )}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={`member-tab-${active}`}
        className="min-w-0"
      >
        {panels[active]}
      </div>
    </div>
  );
}
