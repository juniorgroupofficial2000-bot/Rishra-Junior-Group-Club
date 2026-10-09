"use client";

import { BrandMark } from "@/components/brand/brand-mark";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { ChevronDown, Lock, Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const aboutLinks = [
  { href: "/about", label: "About Club" },
  { href: "/committee", label: "Committee" },
  { href: "/committee", label: "Sub-Committee" },
  { href: "/founders", label: "Founder Members" },
  { href: "/past-president", label: "Past President" },
] as const;

const links = [
  { href: "/", label: "Home" },
  { href: "/facilities", label: "Facilities" },
  { href: "/announcements", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClubHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const phone = siteConfig.contact.phone;
  const email = siteConfig.contact.email;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-[#372F84] text-white">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="rounded-full bg-white p-1">
            <BrandMark size={52} priority />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold tracking-wide sm:text-xl">
              {siteConfig.name.toUpperCase()}
            </span>
            <span className="block truncate text-xs tracking-wide text-white/75">
              Since 2000 · Junior Group
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-4 text-xs lg:flex">
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[#E6D3A3]" aria-hidden />
              {phone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="inline-flex max-w-[280px] items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[#E6D3A3]" aria-hidden />
              <span className="truncate">{email}</span>
            </a>
          ) : null}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#E6D3A3] px-3 py-2 text-xs font-semibold tracking-wide text-[#372F84]"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
            MEMBER LOGIN
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <nav aria-label="Primary" className="hidden border-t border-white/10 lg:block">
        <ul className="mx-auto flex max-w-[1200px] items-center justify-end gap-1 px-6 text-xs font-semibold tracking-[0.14em]">
          <li>
            <Link
              href="/"
              className={cn("inline-flex px-3 py-3", active(pathname, "/") && "text-[#E6D3A3]")}
            >
              HOME
            </Link>
          </li>
          <li
            className="relative"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-3"
              aria-expanded={aboutOpen}
            >
              ABOUT <ChevronDown className="h-3 w-3" aria-hidden />
            </button>
            {aboutOpen ? (
              <ul className="absolute left-0 top-full z-20 min-w-52 bg-white py-2 text-[#372F84] shadow-lg">
                {aboutLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="block px-4 py-2 text-sm tracking-normal hover:bg-[#F4F1EA]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
          {links.slice(1).map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex px-3 py-3",
                  active(pathname, item.href) && "text-[#E6D3A3]",
                )}
              >
                {item.label.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open ? (
        <div className="border-t border-white/10 px-4 py-3 lg:hidden">
          <Link href="/login" className="mb-3 inline-flex bg-[#E6D3A3] px-3 py-2 text-xs font-semibold text-[#372F84]">
            MEMBER LOGIN
          </Link>
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="block py-1 text-sm">{phone}</a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="mb-2 block break-all py-1 text-sm">{email}</a>
          ) : null}
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="block py-2" onClick={() => setOpen(false)}>Home</Link></li>
            {aboutLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="block py-2 pl-3" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            {links.slice(1).map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="block py-2" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
