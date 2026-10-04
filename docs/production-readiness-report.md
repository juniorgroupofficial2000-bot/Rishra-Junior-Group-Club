# Production readiness report

**Audit date:** 3 October 2026  
**Auditors (this pass):** Principal Architect + Security Engineer + QA Lead + UX Lead (agent)  
**Application:** Rishra Junior Group Club (Next.js 16 App Router, Prisma, Auth.js, Razorpay/mock)  
**Related:** [`production-readiness.md`](./production-readiness.md), [`security.md`](./security.md), [`testing.md`](./testing.md)

---

## Verdict

**CONDITIONAL — not approved for live dues / mandates.**

| Surface | Status |
| --- | --- |
| Public English website | **Conditionally ready** after real `SITE_URL`, CMS content, contact env |
| Member portal (non-payment) | **Conditionally ready** with prisma + healthy member↔user links |
| Admin portal | **Conditionally ready** with staff MFA when `REQUIRE_STAFF_MFA=true` |
| Mock / Razorpay **test** payments | **Sandbox only** |
| Razorpay **live** money | **Not approved** |

`npm run build` success alone is **not** a go-live criterion. This pass exercised real HTTP routes, Playwright auth flows, Vitest (auth/security/payments), and production `next start` probes.

---

## Quality gates (executed)

| Gate | Result |
| --- | --- |
| `npm run lint` | Pass (2 unused-var warnings) |
| `npm run typecheck` | Pass |
| `npm test` (Vitest) | **134 passed** |
| `npx playwright test` | **7 passed** |
| `npm run build` | Pass |
| `next start` public route probe | All listed public routes **200** |

---

## Issues found this pass

| ID | Severity | Issue | Fix applied | Remaining risk | Next step |
| --- | --- | --- | --- | --- | --- |
| C1 | **Critical** | Login rejected when TOTP field absent: `FormData.get("totp")` → `null` failed Zod `.optional()` | `loginSchema` pretreats `null`/blank as omitted; unit test added | Low | Keep FormData-shaped fixtures in auth tests |
| C2 | **Critical** | Soft-deleted / unlinked demo member left `MEMBER` user able to sign in → `/member/dashboard` ↔ `/login?error=AccessDenied` **redirect loop** (“Rendering…” forever) | Proxy requires `memberId` on member routes; staff without member redirected to admin; login AccessDenied not re-bounced; authorize rejects MEMBER without linked member; JWT revalidation clears inactive members; soft-delete disables same-email MEMBER users; DB reseeded | Medium if ops soft-delete without deactivating users in odd unlink states | Add integration test for deleted-member login; monitor authz failure metrics |
| H1 | **High** | Staff login defaulted `callbackUrl` to `/member/dashboard`, so SUPER_ADMIN landed on member portal / AccessDenied | `loginAction.postLoginPath()` routes admin→`/admin/dashboard`, member→`/member/dashboard` | Low | E2E already covers admin + member |
| H2 | **High** | Dirty local DB: demo member `deletedAt` set + `userId` null broke member portal | Reseeded SAMPLE data | High if shared sandbox DB is mutated by tests/admin without reseed | Prefer disposable DB per CI job; never soft-delete SAMPLE-001 in shared env |
| M1 | **Medium** | Heritage counters SSR/no-JS showed `0` before animation | `AnimatedCounter` SSR/default = final value; `aria-label` exposes true figure | Low | Visual QA on reduced-motion |
| M2 | **Medium** | In-process rate limits only; bypassed when `E2E_TEST=1` | Tests now unset `E2E_TEST` around rate-limit assertions; bypass unit covered | High at edge without WAF | Edge/WAF limits on `/login`, `/api/auth/*`, webhooks |
| M3 | **Medium** | `CRON_SECRET` often missing from local `.env` (prod assert requires ≥32 chars) | `.env.example` documents required secret; cron verified 401 without / 200 with Bearer | Ops misconfig | Set `CRON_SECRET` in every deploy env |
| L1 | **Low** | Decorative home puja background uses `alt=""` (parent `aria-hidden`) | None (correct pattern) | None | — |
| L2 | **Low** | Playwright coverage is thin vs full role matrix / admin CRUD | Documented | Medium for regression | Expand e2e for treasurer/secretary + admin create/approve flows |
| L3 | **Low** | Auth.js still `5.0.0-beta.x` | None this pass | Supply-chain | Pin upgrades; watch advisories |

---

## Evidence summary

### Public routes (`next start` :3012)

All returned **HTTP 200** with single `<h1>`, Open Graph tags, and canonical (login correctly omits indexable canonical/json-ld expectations for private auth):

`/`, `/about`, `/history`, `/committee`, `/saraswati-puja`, `/events`, `/gallery`, `/announcements`, `/membership`, `/contact`, `/faq`, `/search`, `/privacy`, `/terms`, `/login`, `/robots.txt`, `/sitemap.xml`

- **robots.txt:** disallows `/admin/`, `/member/`, `/api/`, `/login`, `/design-system`
- **sitemap.xml:** includes core public URLs + published puja years
- **Structured data:** Organization + WebSite (+ graph) present on home
- **Metadata language:** English (`en-IN`); no Bengali metadata fields (project English-only rule)

### Authentication & authorization

| Scenario | Result |
| --- | --- |
| Unauthenticated `/member/*`, `/admin/*` | 307 → login |
| Unauthenticated `/api/admin/*` | **401** |
| Member login → dashboard | Pass (Playwright) |
| Member → `/admin/dashboard` | Denied (not on admin URL) |
| Invalid credentials | Error message; stays on login |
| Admin login → admin dashboard | Pass |
| Admin → members list | Pass |
| Member payments/mandate | Pass; `?memberId=someone-else` not reflected in UI (session memberId only) |
| Cron without/wrong secret | **401** |
| Cron with valid Bearer | **200** `{ ok: true, … }` |
| Webhook without signature | **401** (logged `webhook_signature_invalid`) |

Server-side checks confirmed in code paths: `requireMemberId` (no client memberId), `requirePermission` / admin API auth, purpose-scoped media RBAC, MFA gate for staff APIs when configured.

**Role matrix (unit):** MEMBER denied admin; COMMITTEE_MEMBER read-only finance; CONTENT_MANAGER no payments; TREASURER no settings/users write; SUPER_ADMIN full.  
**Not e2e-exercised this pass:** dedicated PRESIDENT / SECRETARY / TREASURER / COMMITTEE_MEMBER browser sessions (RBAC covered in Vitest).

### Member / admin workflows

| Workflow | Evidence |
| --- | --- |
| Login / logout / invalid login | Playwright + integration |
| Dashboard, payments, mandate | Playwright |
| Events (public + member gate) | Playwright |
| Register / edit profile / receipts / attendance / notifications | Partial (nav + pages exist; not full CRUD e2e) |
| Admin create/approve/suspend member, publish, gallery upload, reports, audit | Unit/integration + page routes build; **manual/e2e CRUD still thin** |

### Failure scenarios

| Scenario | Handling |
| --- | --- |
| Invalid login input | Field errors / Zod |
| Rate limit | In-process buckets (disabled under `E2E_TEST=1`) |
| Unauthorized API | 401/403 |
| Deleted member session | Access denied; no portal loop (after fix) |
| Webhook bad/missing sig | 401, no processing |
| Webhook retry / reconcile | Cron endpoint + payment tests |
| Empty / sample CMS | Pages render; sample flags + noindex rules in SEO matrix |
| Payment failure paths | Vitest payment/webhook suites |
| Unavailable decorative image | `alt=""` + hidden container OK |

### Security checklist

| Topic | Assessment |
| --- | --- |
| XSS | No `dangerouslySetInnerHTML` in `app/api`; CMS should stay escaped / trusted admin-only |
| CSRF | Auth.js cookies `SameSite=lax`; mutations via server actions |
| IDOR | Member portal uses session `memberId` only |
| Broken access control | Proxy + layout + action permissions; fix C2 closed portal loop |
| API routes | Admin APIs gated; media purpose RBAC; upload size/MIME/rate limits present |
| Secrets | Not in repo source; `.env` local only; logs use fingerprints |
| Uploads | MIME sniff, purpose max bytes, Content-Length, staff MFA when required |
| Webhooks | HMAC + `timingSafeEqual`; replay/idempotency in processor tests |
| Privilege escalation | Soft-delete deactivates MEMBER/PUBLIC users; JWT revalidates member status |

### Performance / a11y / SEO (spot)

- Hero LCP image preload on home; lazy loading on below-fold media
- Skip link, focus rings, semantic landmarks present
- Reduced-motion respected in motion components / Lenis path
- Counters no longer SSR as `0` (M1)
- Core Web Vitals not measured in lab this pass — run Lighthouse on staging HTTPS before launch

---

## Fixes shipped in this audit

1. `server/auth/config.ts` — TOTP null/blank; MEMBER without member denied; JWT inactive member clear  
2. `proxy.ts` — memberId required; staff without member → admin; AccessDenied login not looped  
3. `server/auth/session.ts` — `requireMemberSession` requires `memberId`  
4. `app/(auth)/actions.ts` + `login/page.tsx` — role-aware post-login path  
5. `prisma-admin-member-repository.ts` — soft-delete disables linked / same-email portal users  
6. `components/motion/animated-counter.tsx` — SSR/a11y final value  
7. Rate-limit tests resilient to `E2E_TEST=1`  
8. `.env.example` — `CRON_SECRET` required documentation  
9. Local DB reseed for SAMPLE demo accounts  

---

## Remaining blockers before live money

1. `PAYMENT_PROVIDER=razorpay`, `PAYMENT_MODE=live`, live keys, Resend email, `REQUIRE_STAFF_MFA=true` with all financial staff enrolled  
2. Edge/WAF rate limits (M2)  
3. Proven backups + reconcile cron schedule with real `CRON_SECRET`  
4. Broader e2e for admin member lifecycle + role-specific staff accounts  
5. Staging Lighthouse + manual Razorpay test-mode certification  

---

## Recommended next step

1. Deploy to **staging** with production-like env (HTTPS `SITE_URL`, prisma, mock or Razorpay **test**).  
2. Run this report’s gate commands + Playwright against staging.  
3. Complete Razorpay test-mode checklist in [`payment-architecture.md`](./payment-architecture.md).  
4. Only then consider live keys under the live-money blockers above.

**Do not declare production-ready for dues collection until those blockers are closed.**
