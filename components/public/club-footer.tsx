import { BrandMark } from "@/components/brand/brand-mark";
import { formatAddressLines, siteConfig } from "@/content/site";
import Link from "next/link";

export function ClubFooter() {
  return (
    <footer className="mt-auto bg-logo-black text-white">
      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-12 md:grid-cols-[auto_1fr_1fr_1fr]">
        <BrandMark size={56} />
        <div>
          <h2 className="text-sm font-semibold tracking-[0.16em]">QUICK LINKS</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/committee">Committee</Link></li>
            <li><Link href="/announcements">News</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/gallery">Gallery</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-[0.16em]">FACILITIES</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {["Community Hall", "Puja Ground", "Meeting Room", "Youth Corner"].map((name) => (
              <li key={name}><Link href="/facilities">{name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-[0.16em]">CONTACT</h2>
          <address className="mt-4 not-italic text-sm leading-7 text-white/80">
            {siteConfig.name}
            {formatAddressLines().map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
            <a className="mt-3 block" href={`tel:${siteConfig.contact.phone}`}>
              {siteConfig.contact.phone}
            </a>
            <a className="block break-all" href={`mailto:${siteConfig.contact.email}`}>
              {siteConfig.contact.email}
            </a>
          </address>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} {siteConfig.name.toUpperCase()}
      </p>
    </footer>
  );
}
