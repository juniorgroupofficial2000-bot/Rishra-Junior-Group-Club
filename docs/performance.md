# Performance checklist — Rishra Junior Group Club

Target: excellent Core Web Vitals on public routes (home, Saraswati Puja, gallery, events).

## Budgets (production, mid-tier mobile)

| Metric | Target | Notes |
| --- | --- | --- |
| **LCP** | ≤ 2.5s | Hero image must paint without waiting on intro/motion |
| **CLS** | ≤ 0.1 | No layout-shifting enter animations; reserved media boxes |
| **INP** | ≤ 200ms | Keep ATF JS lean; defer non-critical motion chrome |
| **TTFB** | ≤ 800ms | Cover-only list queries; `React.cache` for request dedupe |

## LCP

- [x] Hero uses `priority` + `fetchPriority="high"` + `sizes="100vw"` (`HeroLcpImage`)
- [x] Hero image is **not** gated by intro overlay / clip-path hide
- [x] Below-the-fold images are **not** `priority` (home gallery)
- [x] Gallery index: only the first cover is `priority`
- [x] Album detail: first media `priority`; rest lazy + `content-visibility`
- [x] `next/image` AVIF/WebP + quality allowlist (75/80)
- [ ] Replace SVG hero placeholders with optimized rasters when photography is ready
- [ ] Wire CMS `loadHeroMediaBySlot` + `srcMobile` (`?v=md`) for real hero assets
- [ ] Put CDN / long-cache edge in front of `/api/media/*`

## CLS

- [x] Page transition is opacity-only (no `y` translate)
- [x] Media tiles use fixed aspect-ratio boxes before paint
- [x] Fonts via `next/font` with `display: "swap"` + `adjustFontFallback`
- [x] Font weights subset to used values (Playfair 400/600/700, Jakarta 400–700)
- [x] Prefer transform/opacity motion; avoid animating layout properties on ATF
- [ ] Add blur/`placeholder` for photographic heroes when available

## INP / JavaScript

- [x] Server Components for pages + data loading by default
- [x] Public motion chrome (intro, scroll progress, cursor hint) dynamically imported
- [x] ToastProvider scoped to admin/member/design-system — **not** public root
- [x] Below-fold home sections code-split via `next/dynamic`
- [x] `experimental.optimizePackageImports` for `lucide-react` and `motion`
- [x] No third-party analytics / tag managers (keeps main thread clean)
- [ ] Keep SiteHeader slim; avoid new ATF client dependencies without review

## TTFB / data

- [x] Album **list** loaders fetch cover + `_count` only (no full media join)
- [x] Album / event / announcement **by slug** use targeted Prisma queries
- [x] Upcoming/past events share one cached `loadPublishedEvents()` (no double count)
- [x] Public loaders wrapped in `React.cache` (dedupe page + `generateMetadata`)
- [x] Home fetches loaders in `Promise.all`
- [ ] Add ISR/`revalidate` for stable public lists when CMS publish hooks exist

## Animations

- [x] Intro overlay does not block hero image paint
- [x] `prefers-reduced-motion` respected on heroes and chrome
- [x] Parallax/springs are progressive enhancement after mount
- [ ] Avoid new full-viewport overlays on first paint

## Checklist before ship

1. Lighthouse / CrUX on `/`, `/saraswati-puja`, `/gallery`, `/events/[slug]`
2. Confirm Network: LCP candidate is the hero image (or first gallery cover)
3. Confirm no below-fold `priority` images on home
4. Confirm `/robots.txt` still disallows private portals (SEO + crawl waste)
5. Set production `SITE_URL` (SEO/canonicals) and CDN for media
6. Spot-check reduced-motion path (OS setting)

## Key files

| Area | Path |
| --- | --- |
| Hero LCP image | `components/media/hero-lcp-image.tsx` |
| Home / puja heroes | `components/public/home/home-hero.tsx`, `components/heritage/puja-hero.tsx` |
| Deferred chrome | `components/public/public-motion-chrome.tsx` |
| Page transition | `components/public/page-transition.tsx` |
| Public loaders | `server/content/public-loaders.ts` |
| Image config | `next.config.ts` |
| Fonts | `app/layout.tsx` |
