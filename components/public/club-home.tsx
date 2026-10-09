import { aboutStory } from "@/content/about-story";
import { placeholderFacilities, placeholderNews } from "@/content/club-public";
import { siteConfig } from "@/content/site";
import { siteMedia } from "@/content/site-media";
import Link from "next/link";

export function ClubHome() {
  const slides = [
    "/images/home/hero-placeholder-a.svg",
    "/images/home/hero-placeholder-b.svg",
  ];

  return (
    <div className="bg-white text-[#2b2b2b]">
      <section className="grid min-h-[280px] md:grid-cols-2 md:min-h-[420px]">
        <div
          className="min-h-[220px] bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[0]})` }}
          role="img"
          aria-label="Placeholder club photograph"
        />
        <div
          className="min-h-[220px] bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[1]})` }}
          role="img"
          aria-label="Placeholder club photograph"
        />
      </section>

      <section className="mx-auto grid max-w-[1100px] items-center gap-10 px-4 py-16 md:grid-cols-2">
        <img
          src={siteMedia.intro.src}
          alt={siteMedia.intro.alt}
          className="mx-auto w-full max-w-md object-cover shadow-sm"
        />
        <div className="text-center md:text-left">
          <h1 className="font-display text-3xl font-semibold tracking-[0.12em] text-[#cfc8dc] sm:text-4xl">
            ABOUT {siteConfig.shortName}
          </h1>
          <p className="mt-6 text-sm leading-7 text-[#666]">{aboutStory.lead}</p>
          <Link
            href="/about"
            className="mt-6 inline-block text-xs font-semibold tracking-[0.2em] text-[#372F84]"
          >
            READ MORE
          </Link>
        </div>
      </section>

      <section className="bg-[#f7f5f2] py-14">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <h2 className="font-display text-3xl text-[#372F84]">Club History</h2>
          <p className="mt-4 text-sm leading-7 text-[#555]">{aboutStory.paragraphs[1]}</p>
        </div>
      </section>

      <section className="bg-[#372F84] px-4 py-12 text-center text-white">
        <p className="mx-auto max-w-3xl font-display text-2xl leading-snug sm:text-3xl">
          The warmth of neighbourhood. The joy of Saraswati Puja. The feel of Junior Group.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1100px] gap-8 px-4 py-14 md:grid-cols-2">
        {[
          {
            title: "SARASWATI PUJA",
            body: "Our annual Saraswati Puja has been organized since 1 February 2000 and remains the heart of the club.",
            href: "/saraswati-puja",
            image: siteMedia.puja.src,
          },
          {
            title: "COMMUNITY",
            body: "Neighbours, elders, and youth keep the tradition alive — registered as Rishra Junior Group Club on 8 June 2026.",
            href: "/about",
            image: siteMedia.location.src,
          },
        ].map((card) => (
          <article key={card.title}>
            <img src={card.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <h3 className="mt-4 font-display text-xl text-[#372F84]">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#666]">{card.body}</p>
            <Link href={card.href} className="mt-3 inline-block text-xs font-semibold tracking-[0.16em] text-[#372F84]">
              READ MORE
            </Link>
          </article>
        ))}
      </section>

      <section className="bg-[#f7f5f2] py-14">
        <h2 className="text-center font-display text-3xl tracking-wide text-[#372F84]">FACILITIES</h2>
        <ul className="mx-auto mt-8 flex max-w-[1100px] gap-4 overflow-x-auto px-4 pb-2">
          {placeholderFacilities.map((item) => (
            <li key={item.title} className="w-64 shrink-0">
              <Link href="/facilities" className="block bg-white shadow-sm">
                <img src={item.image} alt="" className="h-40 w-full object-cover" />
                <span className="block px-3 py-3 text-center text-sm font-semibold text-[#372F84]">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-[#372F84]">NEWS & EVENTS</h2>
          <Link href="/announcements" className="text-xs font-semibold tracking-[0.16em] text-[#372F84]">
            VIEW ALL
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {placeholderNews.map((item) => (
            <li key={item.title} className="border border-[#eee] p-4">
              <Link href={item.href} className="font-display text-lg text-[#372F84]">
                {item.title}
              </Link>
              <p className="mt-2 text-xs text-[#888]">{item.date}</p>
              <p className="mt-3 text-sm leading-6 text-[#666]">{item.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
