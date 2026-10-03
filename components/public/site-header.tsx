"use client";

import { primaryNav } from "@/content/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { useIsMobileViewport } from "@/lib/hooks/use-media-query";
import { navItemVariants, premiumEase, staggerContainerVariants } from "@/lib/motion";
import type { PublicChromeContext } from "@/server/services/public-chrome-service";
import { AnimatePresence, motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { Bell, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SiteContainer } from "./site-container";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function SiteHeader({
  chrome,
}: {
  chrome?: PublicChromeContext;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const chromeMotion = !reduceMotion && !isMobile;
  const signedIn = Boolean(chrome?.auth.signedIn);
  const portalHref = chrome?.auth.portalHref;
  const portalLabel = chrome?.auth.portalLabel ?? "My portal";
  const displayName = chrome?.auth.displayName;
  const newAnnouncement = chrome?.newAnnouncement;

  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setOpen(false);
  }

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

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
    <motion.header
      className={cn(
        "sticky top-0 z-[var(--z-sticky)]",
        transparent ? "text-white" : "text-ink-900",
      )}
      animate={
        chromeMotion
          ? {
              paddingTop: scrolled ? 10 : 0,
              paddingBottom: scrolled ? 10 : 0,
              paddingLeft: scrolled ? 12 : 0,
              paddingRight: scrolled ? 12 : 0,
            }
          : undefined
      }
      transition={{ duration: 0.45, ease: premiumEase }}
    >
      <motion.div
        className={cn(
          "mx-auto transition-[background-color,box-shadow,border-radius,border-color,backdrop-filter,max-width] duration-500",
          scrolled
            ? "max-w-[68rem] rounded-xl border border-border-subtle bg-surface-raised/97 shadow-md"
            : transparent
              ? "border-b border-transparent bg-transparent"
              : "border-b border-border-subtle bg-surface-raised/97",
        )}
        layout={chromeMotion}
      >
        <SiteContainer
          className={cn(
            "flex items-center justify-between gap-3 transition-[height] duration-450",
            scrolled ? "h-12 sm:h-14" : "h-16 sm:h-[4.5rem]",
          )}
        >
          <Link
            href="/"
            className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2"
          >
            <motion.span
              className={cn(
                "block truncate font-display font-semibold tracking-tight",
                transparent ? "text-white" : "text-ink-900",
                scrolled ? "text-sm sm:text-base" : "text-base sm:text-lg",
              )}
              layout={chromeMotion}
            >
              {siteConfig.name}
            </motion.span>
            <span
              className={cn(
                "block truncate tracking-wide transition-opacity duration-300",
                scrolled ? "text-xs opacity-80" : "text-xs sm:text-sm",
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
                        "group relative type-navigation inline-flex min-h-11 items-center rounded-md px-3 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                        transparent
                          ? active
                            ? "text-white"
                            : "text-white/85 hover:text-white"
                          : active
                            ? "text-ink-900"
                            : "text-ink-600 hover:text-ink-900",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 bg-marigold-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100",
                          active && "scale-x-100",
                        )}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {newAnnouncement ? (
              <Link
                href={`/announcements/${newAnnouncement.slug}`}
                className={cn(
                  "hidden min-h-11 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold uppercase tracking-wide lg:inline-flex",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                  transparent
                    ? "bg-white/15 text-white hover:bg-white/20"
                    : "bg-alta-50 text-alta-700 hover:bg-alta-100",
                )}
              >
                <Bell className="h-3.5 w-3.5" aria-hidden />
                New Announcement
              </Link>
            ) : null}

            <Link
              href="/search"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                transparent
                  ? "text-white/90 hover:bg-white/10"
                  : "text-ink-700 hover:bg-ink-50",
              )}
              aria-label="Search the site"
            >
              <Search className="h-5 w-5" aria-hidden />
            </Link>

            {signedIn && portalHref ? (
              <>
                <Link
                  href={portalHref}
                  className={cn(
                    "hidden min-h-11 items-center gap-2 rounded-md px-2 sm:inline-flex",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                    transparent
                      ? "text-white/90 hover:bg-white/10"
                      : "text-ink-700 hover:bg-ink-50",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                      transparent
                        ? "bg-white/20 text-white"
                        : "bg-ink-100 text-ink-800",
                    )}
                    aria-hidden
                  >
                    {initials(displayName)}
                  </span>
                  <span className="max-w-[8rem] truncate text-sm font-medium">
                    {displayName ?? portalLabel}
                  </span>
                </Link>
                <Link
                  href={portalHref}
                  className={cn(
                    "group hidden min-h-11 items-center gap-1.5 rounded-md bg-alta-500 px-3.5 type-button text-white shadow-xs sm:inline-flex",
                    "transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-alta-600",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                  )}
                >
                  {portalLabel}
                </Link>
              </>
            ) : (
              <>
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
                    "group hidden min-h-11 items-center gap-1.5 rounded-md bg-alta-500 px-3.5 type-button text-white shadow-xs sm:inline-flex",
                    "transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-alta-600",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2",
                  )}
                >
                  Membership
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </>
            )}

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
      </motion.div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: premiumEase }}
            className="overflow-hidden border-t border-border-subtle bg-surface-raised text-ink-900 xl:hidden"
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
              {newAnnouncement ? (
                <Link
                  href={`/announcements/${newAnnouncement.slug}`}
                  className="mb-3 flex min-h-12 items-center gap-2 rounded-md bg-alta-50 px-3 text-sm font-semibold text-alta-700"
                  onClick={() => setOpen(false)}
                >
                  <Bell className="h-4 w-4" aria-hidden />
                  New Announcement — {newAnnouncement.title}
                </Link>
              ) : null}
              <motion.nav
                aria-label="Mobile primary"
                variants={reduceMotion ? undefined : staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <ul className="flex flex-col gap-1 pb-3">
                  <motion.li variants={reduceMotion ? undefined : navItemVariants}>
                    <Link
                      href="/"
                      className="flex min-h-12 items-center rounded-md px-3 py-2 text-base font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setOpen(false)}
                    >
                      Home
                    </Link>
                  </motion.li>
                  {primaryNav.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <motion.li
                        key={item.href}
                        variants={reduceMotion ? undefined : navItemVariants}
                      >
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
                      </motion.li>
                    );
                  })}
                  <motion.li variants={reduceMotion ? undefined : navItemVariants}>
                    <Link
                      href="/search"
                      className="flex min-h-12 items-center rounded-md px-3 py-2 text-base font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setOpen(false)}
                    >
                      Search
                    </Link>
                  </motion.li>
                </ul>
              </motion.nav>
              {signedIn && portalHref ? (
                <Link
                  href={portalHref}
                  className="flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-4 text-base font-medium text-white hover:bg-alta-600"
                  onClick={() => setOpen(false)}
                >
                  {portalLabel}
                  {displayName ? ` · ${displayName}` : ""}
                </Link>
              ) : (
                <>
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
                </>
              )}
            </SiteContainer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
