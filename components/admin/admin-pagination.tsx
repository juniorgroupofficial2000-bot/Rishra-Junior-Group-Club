import { adminQueryString, type AdminListQuery } from "@/lib/admin/list-params";
import Link from "next/link";

export function AdminPagination({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: AdminListQuery;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-ink-500">
        {total} result{total === 1 ? "" : "s"}
      </p>
    );
  }

  const prevHref =
    page > 1
      ? `${basePath}?${adminQueryString(params, { page: String(page - 1) })}`
      : null;
  const nextHref =
    page < totalPages
      ? `${basePath}?${adminQueryString(params, { page: String(page + 1) })}`
      : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-ink-500">
        Page {page} of {totalPages} · {total} result{total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-md border border-border-subtle px-4 text-ink-400">
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-md border border-border-subtle px-4 text-ink-400">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
