"use client";

import { primaryNav } from "@/content/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const isHome = pathname === "/";

  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-sticky)] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        transparent
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b border-border-subtle bg-surface-raised/92 text-ink-900 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-surface-raised/88",
      )}
    >
      <SiteContainer className="flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
        <Link
          href="/"
          className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              "block truncate font-display text-base font-semibold tracking-tight sm:text-lg",
              transparent ? "text-white" : "text-ink-900",
            )}
          >
            {siteConfig.name}
          </span>
          <span
            className={cn(
              "block truncate text-xs tracking-wide sm:text-sm",
              transparent ? "text-white/70" : "text-ink-500",
            )}
          >
            Since 2000 · {siteConfig.shortName}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {primaryNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "type-navigation inline-flex min-h-11 items-center rounded-md px-3 transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                      transparent
                        ? active
                          ? "bg-white/15 text-white"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                        : active
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
            href="/login"
            className={cn(
              "hidden min-h-11 items-center rounded-md px-3 type-navigation sm:inline-flex",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
              transparent
                ? "text-white/90 hover:bg-white/10"
                : "text-ink-700 hover:bg-ink-50",
            )}
          >
            Member login
          </Link>
          <Link
            href="/membership"
            className={cn(
              "hidden min-h-11 items-center rounded-md bg-alta-500 px-3.5 type-button text-white shadow-xs sm:inline-flex",
              "transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-alta-600",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
            )}
          >
            Membership
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-md border xl:hidden",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
              transparent
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-border-default text-ink-800 hover:bg-ink-50",
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

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="border-t border-border-subtle bg-surface-raised text-ink-900 xl:hidden"
          >
            <SiteContainer className="py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="type-caption text-ink-500">Menu</p>
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
                  <li>
                    <Link
                      href="/"
                      className="flex min-h-12 items-center rounded-md px-3 py-2 text-base font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  {primaryNav.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex min-h-12 items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                href="/login"
                className="mb-2 flex min-h-12 items-center rounded-md px-3 text-base font-medium text-ink-700 hover:bg-ink-50"
                onClick={() => setOpen(false)}
              >
                Member login
              </Link>
              <Link
                href="/membership"
                className="flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-4 text-base font-medium text-white hover:bg-alta-600"
                onClick={() => setOpen(false)}
              >
                Membership
              </Link>
            </SiteContainer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
