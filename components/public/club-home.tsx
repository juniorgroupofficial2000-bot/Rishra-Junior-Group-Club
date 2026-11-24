import { aboutStory } from "@/content/about-story";
import { noticeChannels, upcomingEventCalendar, virtualFacilities } from "@/content/club-roster";
import { siteConfig } from "@/content/site";
import { siteMedia } from "@/content/site-media";
import { HeroCarousel } from "@/components/public/hero-carousel";
import Link from "next/link";

const heroSlides = [
  "/images/hero/slides/1.jpg",
  "/images/hero/slides/2.jpg",
  "/images/hero/slides/3.jpg",
  "/images/hero/slides/4.jpg",
  "/images/hero/slides/5.jpg",
  "/images/hero/slides/6.jpg",
  "/images/hero/slides/7.jpg",
  "/images/hero/slides/8.jpg",
  "/images/hero/slides/9.jpg",
].map((src, index) => ({
  src,
  alt: `Club photograph ${index + 1}`,
}));

export function ClubHome() {
  return (
    <div className="bg-white text-[#333333]">
      <HeroCarousel images={heroSlides} />

      <section className="mx-auto grid max-w-[1100px] items-center gap-10 px-4 py-16 md:grid-cols-2">
        <img
          src={siteMedia.intro.src}
          alt={siteMedia.intro.alt}
          className="mx-auto w-full max-w-md object-cover shadow-sm"
        />
        <div className="text-center md:text-left">
          <h1 className="font-display text-3xl font-semibold tracking-[0.08em] text-logo-blue sm:text-4xl">
            ABOUT {siteConfig.shortName}
          </h1>
          <p className="mt-6 text-sm leading-7 text-[#333333]">{aboutStory.lead}</p>
          <Link
            href="/about"
            className="mt-6 inline-block text-xs font-semibold tracking-[0.2em] text-logo-blue"
          >
            READ MORE
          </Link>
        </div>
      </section>

      <section className="bg-[#F8F9FA] py-14">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <h2 className="font-display text-3xl text-logo-blue">Club History</h2>
          <p className="mt-4 text-sm leading-7 text-[#333333]">{aboutStory.paragraphs[1]}</p>
        </div>
      </section>

      <section className="bg-[#F8F9FA] px-4 py-12 text-center text-[#333333]">
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
            <h3 className="mt-4 font-display text-xl text-logo-blue">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#333333]">{card.body}</p>
            <Link href={card.href} className="mt-3 inline-block text-xs font-semibold tracking-[0.16em] text-logo-blue">
              READ MORE
            </Link>
          </article>
        ))}
      </section>

      <section className="bg-[#F8F9FA] py-14">
        <h2 className="text-center font-display text-3xl tracking-wide text-logo-blue">FACILITIES</h2>
        <ul className="mx-auto mt-8 flex max-w-[1100px] gap-4 overflow-x-auto px-4 pb-2">
          {virtualFacilities.map((item) => (
            <li key={item.title} className="w-64 shrink-0">
              <Link href="/facilities" className="block bg-white p-4 shadow-sm">
                <span className="block text-center text-sm font-semibold text-logo-blue">
                  {item.title}
                </span>
                <span className="mt-2 block text-center text-xs leading-5 text-[#555]">
                  {item.perk}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-logo-blue">NOTICE & EVENTS</h2>
          <Link href="/announcements" className="text-xs font-semibold tracking-[0.16em] text-logo-blue">
            VIEW ALL
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {noticeChannels.slice(0, 3).map((item) => (
            <li key={item.title} className="border border-[#eee] p-4">
              <Link href={item.href} className="font-display text-lg text-logo-blue">
                {item.title}
              </Link>
              <p className="mt-3 text-sm leading-6 text-[#333333]">{item.summary}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <h3 className="font-display text-xl text-logo-blue">This year’s calendar</h3>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {upcomingEventCalendar.map((entry) => (
              <li key={entry.month}>
                <span className="font-semibold">{entry.month}:</span> {entry.items.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
