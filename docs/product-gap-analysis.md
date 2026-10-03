# Product gap analysis — Rishra Junior Group Club

**Role:** Principal Product Architect + Senior UX / Frontend  
**Date:** 3 October 2026  
**Goal:** Move from “labelled CMS demo” to a production-feeling community platform — without inventing club facts.

---

## Why it feels like a dummy website

The **backend is largely real** (auth, RBAC, MFA, Prisma CMS, media, Razorpay webhooks, admin ops). The **public surface still reads as a demo** because:

1. Visible `[PLACEHOLDER]` / `[SAMPLE]` strings appear on the homepage and interior pages.
2. SVG “photographs” labelled as placeholders dominate heroes and sections.
3. Homepage hard-imports file `homeContent` and never uses published CMS overlays.
4. Empty CMS falls back to SAMPLE catalogs instead of honest empty states.
5. About is a dashed “Content forthcoming” box with a `[PLACEHOLDER]` badge.
6. Contact shows unset env placeholders and a non-functional form slot.
7. Membership shows an “Online application” architecture stub (`draft.status`, broken `/membership/apply` path).
8. Home Events/Gallery still render marketing chrome when there is nothing to show.
9. Member dues UI admits “placeholders until billing is configured.”
10. SAMPLE seed rows can appear in member/admin lists during local demos.

---

## Current functionality (real)

| Area | Status |
| --- | --- |
| Public routes (about, history, puja, committee, events, gallery, membership, contact, FAQ, legal) | Present |
| Auth.js login, sessions, RBAC, member isolation | Real |
| Staff TOTP MFA | Real |
| Admin CMS CRUD + media upload | Real |
| Payments/mandates + webhook verify + idempotency + reconcile cron | Real |
| Member portal (profile, payments, mandate, events, receipts) | Real (DB-backed) |
| SEO metadata, sitemap, robots, JSON-LD | Real |
| Error boundaries, segment loading skeletons | Real |
| Responsive admin record cards / portal drawers | Real |

---

## Missing functionality

| Gap | Who needs it | Notes |
| --- | --- | --- |
| Online membership application | Prospective members | Stub only; no `/membership/apply` |
| Public contact form | Visitors | Slot exists; no submit |
| Verified About narrative | Public | Empty shell |
| Home ↔ CMS wiring | Editors | `loadPublishedHomeContent` unused |
| Empty-first public catalogs | Public | File SAMPLE fallback when DB empty |
| Real photography | Public | SVG placeholders |
| Contact env values | Public | Must set `CONTACT_PUBLIC_*` |
| “Email sent” UX | Members | Needs Resend (or equivalent) |

---

## Fake / demo functionality

| Item | Location | Fix approach |
| --- | --- | --- |
| `[PLACEHOLDER: …]` copy | `content/home.ts`, membership, heritage | Remove; omit or empty-state |
| `[SAMPLE]` albums/events/announcements | `content/*`, seed | Don’t fall back publicly; empty grids |
| Membership application panel | `membership-application-panel.tsx` | Replace with Contact enquire |
| Contact form placeholder | `contact/page.tsx` | Honest empty / remove |
| About ContentPlaceholder | `about/page.tsx` | Verified short About |
| Demo login credentials | `login-form.tsx` | Keep only when mock driver |
| Console notification `ok: true` in dev | console channels | Never claim delivery in UI |
| Animated heritage counters | `home-heritage.tsx` | Soften; verified year only |

---

## UX problems

- Marketing chrome without content (empty gallery grid under a heading).
- Architecture language (“workflow status”, “CMS-ready”) on public pages.
- Bracket tokens look like unfinished templates.
- Placeholder photos undermine trust.
- Dues hint language feels unfinished for members.

---

## Missing states

| State | Gap |
| --- | --- |
| Empty | Home gallery/announcements; public SAMPLE fallback hides emptiness |
| Loading | Segment loaders OK; some dynamic home sections fine |
| Error | Route error pages OK |
| Success | Contact/application have none (no workflows yet) |
| No permission | Portals OK |

---

## Missing business workflows

1. Membership enquiry → staff review → acceptance (public apply not built).  
2. Visitor contact → email ticket.  
3. Committee-approved About / registration facts publishing.  
4. Billing configuration that surfaces real dues without placeholder copy.

---

## Security concerns (product-facing)

- Demo credentials must never appear when `REPOSITORY_DRIVER=prisma`.  
- SAMPLE financial rows must not be mistaken for real dues (label + don’t seed prod).  
- Contact form (when added) needs rate limits + Resend; no open relay.

---

## Mobile / accessibility / performance

| Area | Assessment |
| --- | --- |
| Mobile | Portal drawers + record cards improved; public still heavy on motion |
| A11y | Skip link, focus rings present; placeholder mono tags are noise |
| Perf | Hero LCP + deferred motion OK; SVG placeholders cheap but look fake |

---

## Recommended implementation order

1. **Strip visible PLACEHOLDER/SAMPLE language** from public file content and empty components.  
2. **Honest empty states** — no SAMPLE file fallback for public lists when CMS empty; collapse empty home sections.  
3. **About + Contact + Membership** — real/minimal verified copy; remove fake application panel.  
4. **Wire homepage to `loadPublishedHomeContent()`** and pass section props.  
5. **Default SAMPLE inclusion off** unless `CONTENT_INCLUDE_SAMPLE=true`.  
6. **Member dues empty language** — “No dues on file” instead of placeholder hints.  
7. **Puja upcoming / SAMPLE blocks** — hide when unverified.  
8. Later: contact form, membership apply, real photos via media library.

---

## Success criteria for this pass

- Public homepage no longer shows `[PLACEHOLDER]` or SAMPLE marketing blurbs.  
- Empty sections say so clearly or disappear.  
- About/Contact/Membership feel like a real club site with sparse honest content.  
- No invented member counts, donation totals, or testimonials.  
- Lint / typecheck / tests / build pass.

---

## Implementation status (this pass)

Completed highest-impact items from the order above:

1. Stripped public `[PLACEHOLDER]` / SAMPLE marketing copy (home, membership, heritage, events, gallery, history).  
2. Public loaders return empty catalogs (not SAMPLE file fallbacks) when CMS is empty and `CONTENT_INCLUDE_SAMPLE` is off.  
3. About / Contact / Membership enquiry panel rewritten with honest empty states.  
4. Homepage uses `loadPublishedHomeContent()` and collapses empty list sections.  
5. Sample inclusion defaults off; provenance badges hide “Placeholder”; SAMPLE still labelled when demos are enabled.  
6. Member dashboard dues copy uses “No dues on file” instead of placeholder billing hints.  
7. Puja upcoming / galleries / archive empty states are honest when unverified.
