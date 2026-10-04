"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type PortalNavLink = {
  href: string;
  label: string;
};

/**
 * Overlay drawer for member/admin mobile navigation.
 * Locks body scroll, closes on Escape, restores focus to the menu button.
 */
export function PortalNavDrawer({
  id,
  open,
  onClose,
  label,
  items,
  pathname,
  menuButtonRef,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  label: string;
  items: PortalNavLink[];
  pathname: string;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, menuButtonRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <nav
        id={id}
        aria-label={label}
        className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-border-subtle bg-surface-raised pb-[env(safe-area-inset-bottom)] shadow-xl"
      >
        <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4 pt-[env(safe-area-inset-top)]">
          <p className="font-display text-base font-semibold text-ink-900">{label}</p>
          <button
            ref={closeRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-default text-ink-800 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              onClose();
              menuButtonRef.current?.focus();
            }}
          >
            <span className="sr-only">Close menu</span>
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto overscroll-contain p-3">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-ink-900 text-white"
                      : "text-ink-700 hover:bg-ink-50",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
