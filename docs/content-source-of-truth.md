# Content source of truth

**Rule:** Never invent members, events, payments, gallery albums, announcements, attendance, or statistics to fill empty UI. Show an empty state instead.

## Data flow

```
Admin portal (create / edit / publish)
        ↓
PostgreSQL (Prisma models)
        ↓
server/content/public-loaders.ts
        ↓
Public pages & home sections
```

Media binaries live in object storage; PostgreSQL stores `MediaAsset` metadata and relations.

## Domain models (Prisma)

| Model | Public surface | Admin surface |
| --- | --- | --- |
| `User` | — (auth) | Users / MFA |
| `Member` | Verify card (token) | Members |
| `PublicCommitteeMember` | `/committee`, home | Content → committee |
| `Membership` / `MembershipPlan` | Member portal | Memberships |
| `Payment` / `PaymentMandate` / `Receipt` | Member portal | Payments / mandates |
| `Event` / `EventRegistration` / `EventAttendance` | `/events`, member events | Events |
| `Announcement` | `/announcements` | Announcements |
| `Notification` | Member notifications | — |
| `GalleryAlbum` / `GalleryMedia` | `/gallery` | Gallery |
| `PujaYear` / schedule items | `/saraswati-puja` | Puja / content |
| `TimelineEntry` | `/history` | History / content |
| `SiteContentBlock` | Homepage copy overlays | Content CMS |
| `FaqItem` | `/faq` | Content CMS |
| `AuditLog` | — | Audit logs |

## File modules under `content/`

| Path | Role |
| --- | --- |
| `content/site.ts` | Verified club facts (name, address, established year) |
| `content/home.ts` | Brand shell copy only (no people lists / calendars) |
| `content/site-media.ts` | SVG brand placeholders until HERO media slots are uploaded |
| `content/committee.ts`, `events.ts`, `announcements.ts`, `gallery.ts`, heritage files | **Seed fixtures / types** — not runtime public fallbacks |
| `content/include-sample.ts` | `CONTENT_INCLUDE_SAMPLE` gate (default OFF; forbidden in production) |

## Empty databases

When published rows are missing, loaders return `[]` / `null`. Catalog pages use `EmptyState` (e.g. “No announcements yet.”). Home list sections omit themselves when empty rather than inventing previews.

## Seed data

- `prisma/seed.ts` — SAMPLE demo users, members, payments (blocked in production unless `ALLOW_DEMO_SEED=true`).
- `prisma/seed-cms-content.ts` — CMS bootstrap; skips `sample` / `placeholder` heritage unless `CONTENT_INCLUDE_SAMPLE=true`.
- With `DATABASE_URL` set, `REPOSITORY_DRIVER` defaults to **prisma** (mock only when explicitly `mock` or no database URL).

## Admin → public checklist

1. Publish committee members → `/committee` updates.
2. Publish events → `/events` and home events preview update.
3. Publish announcements → `/announcements` updates.
4. Publish gallery albums + media assets → `/gallery` updates.
5. Publish puja years / timeline → archive and history update.
6. Overlay homepage section bodies via `SiteContentBlock` → home copy updates without code changes.
