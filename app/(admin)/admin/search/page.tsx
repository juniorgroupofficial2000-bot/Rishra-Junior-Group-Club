import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { searchAdminContent } from "@/server/services/search-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin search",
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = {
  member: "Member",
  event: "Event",
  announcement: "Announcement",
  payment: "Payment",
  user: "User",
};

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission(Permissions.DASHBOARD_VIEW, "/admin/search");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const results = q.length >= 2 ? await searchAdminContent(q) : [];

  return (
    <>
      <AdminPageHeader
        title="Search"
        description="Find members, events, announcements, payments, and users."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <form
          method="get"
          action="/admin/search"
          className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 sm:flex-row sm:items-end"
        >
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              Query
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, membership number, email, title…"
              className="min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800"
          >
            Search
          </button>
        </form>

        {q.length > 0 && q.length < 2 ? (
          <p className="text-sm text-ink-500">
            Enter at least two characters to search.
          </p>
        ) : null}

        {q.length >= 2 && results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-sm text-ink-500">
            No operational matches for “{q}”.
          </p>
        ) : null}

        {results.length > 0 ? (
          <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-raised">
            {results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-2 px-4 py-4 hover:bg-ink-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="mb-1">
                      <Badge variant="outline">
                        {TYPE_LABEL[item.type] ?? item.type}
                      </Badge>
                    </div>
                    <p className="font-medium text-ink-900">{item.title}</p>
                    <p className="text-sm text-ink-500">{item.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
