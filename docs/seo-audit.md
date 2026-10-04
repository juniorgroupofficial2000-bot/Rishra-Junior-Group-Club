# Technical SEO audit — Rishra Junior Group Club

Audit date: 2026-10-03  
Scope: all App Router public, auth, member, and admin routes.

## Language strategy (English only — Bengali/English decision)

Product rule: **English-only** UI and metadata. A bilingual Bengali/English metadata strategy is intentionally **not** implemented (workspace English-only rule). Cultural terms (Saraswati Puja, Rishra) remain in English wording.

| Item | Implementation |
| --- | --- |
| HTML `lang` | `en-IN` |
| Open Graph locale | `en_IN` |
| Schema.org `inLanguage` | `en-IN` |
| `hreflang` | `en` + `en-IN` only (same URLs) |
| Bengali metadata / `hreflang="bn"` / `titleBn` | **Not used** (out of scope) |

## Helpers

| Helper | Path |
| --- | --- |
| Site URL / absolute URLs | `lib/seo/config.ts` (`SITE_URL`) |
| Metadata builder | `lib/seo/metadata.ts` |
| Route indexability matrix | `lib/seo/routes.ts` |
| JSON-LD | `lib/seo/structured-data.ts` |
| Heritage JSON-LD | `lib/heritage-structured-data.ts` |

`SITE_URL` is required in production runtime. Localhost is never hard-coded into page content; it is only a development fallback when `SITE_URL` is unset.

## Public routes (indexable)

| Route | Canonical | OG / Twitter | JSON-LD | Breadcrumbs | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | Yes | Yes + hero image | Organization, LocalBusiness, WebSite, WebPage | N/A | Single `h1` in hero brand treatment |
| `/about` | Yes | Yes | WebPage + breadcrumbs | Yes | Placeholder body OK |
| `/history` | Yes | Yes | WebPage + Organization | Yes | Timeline |
| `/committee` | Yes | Yes | WebPage | Yes | Names/roles only |
| `/saraswati-puja` | Yes | Yes + hero | EventSeries + WebPage | Yes | No invented event dates |
| `/events` | Yes | Yes | WebPage | Yes | List |
| `/events/[slug]` | Yes* | Yes | Event* + breadcrumbs | Yes | *Sample → `noindex`, omitted from sitemap, no Event schema |
| `/gallery` | Yes | Yes | WebPage | Yes | List |
| `/gallery/[slug]` | Yes* | Yes + cover | WebPage + breadcrumbs | Yes | *Sample → `noindex` |
| `/announcements` | Yes | Yes | WebPage | Yes | List |
| `/announcements/[slug]` | Yes* | Article OG | NewsArticle* + breadcrumbs | Yes | *Sample → `noindex` |
| `/membership` | Yes | Yes | via page chrome | Yes | Public info only |
| `/contact` | Yes | Yes | ContactPage + LocalBusiness | Yes | Address semantics |
| `/faq` | Yes | Yes | FAQPage when FAQs exist | Yes | `h1` + per-question `h2` |
| `/privacy` | Yes | Yes | page chrome | Yes | Legal |
| `/terms` | Yes | Yes | page chrome | Yes | Legal |

\* Non-sample published entities only for sitemap + Event/NewsArticle schema.

## Private / non-indexable

| Route | robots | sitemap | robots.txt |
| --- | --- | --- | --- |
| `/login` | `noindex` (auth layout) | Excluded | `Disallow: /login` |
| `/member/*` | `noindex` (member layout) | Excluded | `Disallow: /member/` |
| `/admin/*` | `noindex` (admin layout) | Excluded | `Disallow: /admin/` |
| `/api/*` | N/A | Excluded | `Disallow: /api/` |
| `/design-system` | `noindex` | Excluded | `Disallow: /design-system` |

## Crawl surfaces

- `app/robots.ts` — allow `/`, disallow private prefixes, `Sitemap` + `Host` from `SITE_URL`
- `app/sitemap.ts` — all `publicPages` + published non-sample events/albums/announcements via `absoluteUrl()`

## Semantic HTML & headings

- Public layout: skip link, `header` / `main#main-content` / `footer`
- Interior pages: single page `h1` via `AnimatedPageShell` (or detail `h1` on album/event)
- Sections use `h2`+ under that `h1`
- Contact uses `<address>` for postal address
- Images require `alt` (CMS media validation enforces alt on uploads; content images carry alt in media models)

## Open items / follow-ups

1. Replace remaining placeholder body copy on About / Privacy / Terms when legally approved (metadata already English and indexable).
2. Add a real raster default OG image (`/brand/og-default.png`) when brand photography is ready; SVG OG is a temporary default.
3. When a verified social profile exists, add `sameAs` to Organization JSON-LD.
4. Keep SAMPLE content labelled and `noindex` / out of sitemap forever.

## Verification

- Unit tests: `tests/seo/helpers.test.ts`
- Production: set `SITE_URL=https://your-domain.example` before deploy
- Spot-check: `/robots.txt`, `/sitemap.xml`, View Source JSON-LD, and rich-result testing on Event / FAQ pages after content is published
