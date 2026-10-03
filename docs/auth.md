# Authentication & authorization

**Stack:** Auth.js (NextAuth v5) · JWT sessions · bcrypt credentials · PostgreSQL user/member links  
**Related:** [`docs/security.md`](./security.md), [`docs/database.md`](./database.md)

---

## Session lifecycle

| Concern | Behavior |
| --- | --- |
| Strategy | JWT (`session.strategy = "jwt"`) |
| Max age | 8 hours (`SESSION_MAX_AGE_SECONDS`) |
| Refresh cadence | `updateAge` 30 minutes |
| DB revalidation | Node JWT callback every 5 minutes (`SESSION_REVALIDATE_MS`) |
| Inactive user / suspended member | Token marked `SessionInactive`; `session.user.id` cleared |
| Logout | `logoutAction` → Auth.js `signOut({ redirectTo: "/login" })` |
| Login rate limit | Per IP + email (`app/(auth)/actions.ts`) |

Never trust client-only route guards. Edge `proxy.ts` is the first gate; layouts, pages, server actions, and API handlers re-check.

---

## Defense layers

1. **Edge proxy** (`proxy.ts`) — `/member/*`, `/admin/*`, `/api/admin/*` require a session; admin needs `ADMIN_ACCESS`.
2. **Layouts** — `requireMemberSession` / `requireAdminSession`.
3. **Pages** — `requirePermission(...)` per admin page; `requireMemberId()` for member data pages.
4. **Server actions** — `assertPermission` / `assertCanWritePayments` / `assertCanWriteSecuritySettings` before mutations.
5. **API** — `requireApiPermission` returns JSON 401/403 (no HTML redirects).

---

## Member data isolation (IDOR)

- `requireMemberId()` reads `memberId` **only from the session**.
- Prisma re-check: `member.id === session.memberId` **and** `member.userId === session.user.id`, status `ACTIVE`, not soft-deleted.
- Member mandate/payment actions pass that session `memberId` into services — never a form field.
- `assertMemberOwnsResource(sessionMemberId, resourceMemberId)` rejects cross-member access.

Admin member edits intentionally accept a target `memberId` and require `MEMBERS_*` permissions.

---

## Role → capability (summary)

| Actor | Admin portal | Payments write | Mandates write | Settings write | Notes |
| --- | --- | --- | --- | --- | --- |
| `MEMBER` | No | No | Own mandate only | No | Session-scoped data |
| `COMMITTEE_MEMBER` | Yes (read-heavy) | No | No | No | No financial mutations |
| `CONTENT_MANAGER` | Yes (content) | No | No | No | No payment data writes |
| `TREASURER` | Yes | Yes | Yes | **No** | Security config env-only |
| `SUPER_ADMIN` / `ADMIN` | Full | Yes | Yes | Yes* | *UI still cannot edit secrets |

Full matrix: `server/domain/permissions.ts`. Route map: `server/auth/route-permissions.ts`.

---

## Key modules

| Module | Role |
| --- | --- |
| `server/auth/authorize.ts` | Pure asserts + `AuthorizationError` (unit-tested) |
| `server/auth/api-auth.ts` | API session + permission |
| `server/auth/session.ts` | Page redirects (`requirePermission`, …) |
| `server/auth/member-context.ts` | Session-scoped member id |
| `app/(admin)/actions/*` | Mutation entrypoints with permission asserts |
| `app/(auth)/actions.ts` | Login / logout |

---

## Tests

See `tests/auth/*` for permission matrix, IDOR isolation, financial/security denials, and SUPER_ADMIN grants.
