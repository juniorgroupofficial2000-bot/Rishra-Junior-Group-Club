"use client";

import { logoutAction } from "@/app/(auth)/actions";
import { PortalNavDrawer } from "@/components/portal/portal-nav-drawer";
import type { AdminNavItem } from "@/content/admin-nav";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AdminShell({
  userName,
  roleLabel,
  navItems,
  environmentLabel,
  brandName,
  children,
}: {
  userName: string;
  roleLabel: string;
  navItems: AdminNavItem[];
  /** Uppercase LOCAL / DEVELOPMENT / STAGING — omit in production. */
  environmentLabel?: string | null;
  brandName?: string;
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <Link
              href="/admin/dashboard"
              className="block truncate font-display text-base font-semibold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {environmentLabel
                ? `${environmentLabel} · ${(brandName ?? siteConfig.name).toUpperCase()}`
                : `${siteConfig.shortName} Admin`}
            </Link>
            <p className="truncate text-xs text-ink-500">
              {environmentLabel ? "Admin · " : null}
              {userName} · {roleLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/member/dashboard"
              className="hidden min-h-11 items-center rounded-md px-3 text-sm text-ink-600 hover:bg-ink-50 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Member portal
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
              aria-controls="admin-nav"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">Menu</span>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <PortalNavDrawer
        id="admin-nav"
        open={open}
        onClose={() => setOpen(false)}
        label="Admin menu"
        items={navItems}
        pathname={pathname}
        menuButtonRef={menuButtonRef}
      />

      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[16rem_1fr]">
        <nav
          id="admin-nav-desktop"
          aria-label="Admin"
          className="hidden border-r border-border-subtle bg-surface-raised lg:block"
        >
          <ul className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
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
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
