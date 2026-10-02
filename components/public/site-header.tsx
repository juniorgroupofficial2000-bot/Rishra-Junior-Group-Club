"use client";

import { primaryNav } from "@/content/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SiteContainer } from "./site-container";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border-subtle bg-surface-raised/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface-raised/85">
      <SiteContainer className="flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">
        <Link
          href="/"
          className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="block truncate font-display text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
            {siteConfig.name}
          </span>
          <span className="block truncate text-xs text-ink-500 sm:text-sm">
            {siteConfig.shortName}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active
                        ? "bg-ink-100 text-ink-900"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/membership"
            className={cn(
              "hidden min-h-11 items-center rounded-md bg-ink-900 px-3.5 text-sm font-medium text-white shadow-xs sm:inline-flex",
              "transition-colors hover:bg-ink-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            Membership
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-default text-ink-800 lg:hidden",
              "hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </SiteContainer>

      {open ? (
        <div
          id={panelId}
          className="border-t border-border-subtle bg-surface-raised lg:hidden"
        >
          <SiteContainer className="py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-ink-500">Menu</p>
              <button
                ref={closeButtonRef}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-700 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  setOpen(false);
                  menuButtonRef.current?.focus();
                }}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav aria-label="Mobile primary">
              <ul className="flex flex-col gap-1 pb-3">
                {primaryNav.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          active
                            ? "bg-ink-100 text-ink-900"
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
            <Link
              href="/announcements"
              className="mb-2 flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink-700 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Announcements
            </Link>
            <Link
              href="/membership"
              className="flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-4 text-base font-medium text-white hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Membership
            </Link>
          </SiteContainer>
        </div>
      ) : null}
    </header>
  );
}
