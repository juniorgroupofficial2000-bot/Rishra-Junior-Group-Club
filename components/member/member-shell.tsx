"use client";

import { logoutAction } from "@/app/(auth)/actions";
import { PortalNavDrawer } from "@/components/portal/portal-nav-drawer";
import { memberNav } from "@/content/member-nav";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import {
  Bell,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const mobileBottomNav = [
  { href: "/member/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/member/payments", label: "Payments", icon: CreditCard },
  { href: "/member/events", label: "Events", icon: CalendarDays },
  { href: "/member/notifications", label: "Alerts", icon: Bell },
] as const;

export function MemberShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <div className="min-h-dvh bg-surface-canvas bg-heritage-grain">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-raised/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <Link
              href="/member/dashboard"
              className="block truncate font-display text-base font-semibold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {siteConfig.shortName} Members
            </Link>
            <p className="truncate text-xs text-ink-500">{userName}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="hidden min-h-11 items-center rounded-md px-3 text-sm text-ink-600 hover:bg-ink-50 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Public site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium text-ink-800 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign out
              </button>
            </form>
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-default lg:hidden"
              aria-expanded={open}
              aria-controls="member-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <PortalNavDrawer
        id="member-nav"
        open={open}
        onClose={() => setOpen(false)}
        label="Member menu"
        items={memberNav}
        pathname={pathname}
        menuButtonRef={menuButtonRef}
      />

      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[16rem_1fr]">
        <nav
          id="member-nav-desktop"
          aria-label="Member"
          className="hidden border-r border-border-subtle bg-surface-raised lg:block"
        >
          <ul className="flex flex-col gap-1 p-3">
            {memberNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
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
        <div className="min-w-0 pb-20 lg:pb-0">{children}</div>
      </div>

      <nav
        aria-label="Member shortcuts"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-surface-raised/95 backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid max-w-6xl grid-cols-5 gap-1 px-2 py-2">
          {mobileBottomNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[10px] font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "text-ink-900" : "text-ink-500",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[10px] font-medium text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={open}
              aria-controls="member-nav"
              onClick={() => setOpen(true)}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
