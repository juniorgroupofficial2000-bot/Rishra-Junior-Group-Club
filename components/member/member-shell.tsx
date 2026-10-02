"use client";

import { logoutAction } from "@/app/(auth)/actions";
import { memberNav } from "@/content/member-nav";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function MemberShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          <div className="flex items-center gap-2">
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

      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[16rem_1fr]">
        <nav
          id="member-nav"
          aria-label="Member"
          className={cn(
            "border-b border-border-subtle bg-surface-raised lg:border-b-0 lg:border-r",
            open ? "block" : "hidden lg:block",
          )}
        >
          <ul className="flex flex-col gap-1 p-3">
            {memberNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
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
