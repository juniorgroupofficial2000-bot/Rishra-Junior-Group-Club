import { AuditActions } from "@/server/audit/actions";
import { requireApiPermission } from "@/server/auth/api-auth";
import { Permissions } from "@/server/domain/permissions";
import { parseOptionalDate } from "@/lib/admin/list-params";
import {
  exportAdminMandatesCsv,
  exportAdminPaymentsCsv,
} from "@/server/services/admin-list-service";
import { exportMembersCsv } from "@/server/services/member-admin-service";
import { writeAuditEvent } from "@/server/services/audit-service";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ resource: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { resource } = await context.params;
  const url = new URL(request.url);

  const permission =
    resource === "payments"
      ? Permissions.PAYMENTS_READ
      : resource === "mandates"
        ? Permissions.MANDATES_READ
        : resource === "members"
          ? Permissions.MEMBERS_EXPORT
          : null;

  if (!permission) {
    return NextResponse.json({ error: "Unknown export resource." }, { status: 404 });
  }

  const authz = await requireApiPermission(permission);
  if (authz instanceof NextResponse) return authz;

  if (!consumeRateLimit(`admin-export:${authz.userId}`, 20, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many exports." }, { status: 429 });
  }

  let csv: string;
  let metadata: Record<string, unknown>;

  if (resource === "members") {
    const idsParam = url.searchParams.get("ids");
    const ids = idsParam
      ? idsParam.split(",").map((id) => id.trim()).filter(Boolean)
      : undefined;
    const filters = {
      query: url.searchParams.get("query") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      planId: url.searchParams.get("planId") ?? undefined,
      committeeRole: url.searchParams.get("committeeRole") ?? undefined,
      joinedFrom: parseOptionalDate(
        url.searchParams.get("joinedFrom") ?? undefined,
      ),
      joinedTo: parseOptionalDate(url.searchParams.get("joinedTo") ?? undefined),
      sortBy: url.searchParams.get("sortBy") ?? undefined,
      sortDir: url.searchParams.get("sortDir") ?? undefined,
      ids,
    };
    csv = await exportMembersCsv(filters);
    metadata = {
      resource,
      ...filters,
      joinedFrom: filters.joinedFrom?.toISOString() ?? null,
      joinedTo: filters.joinedTo?.toISOString() ?? null,
      selectedCount: ids?.length ?? null,
    };
  } else {
    const filters = {
      query: url.searchParams.get("query") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      memberId: url.searchParams.get("memberId") ?? undefined,
      from: parseOptionalDate(url.searchParams.get("from") ?? undefined),
      to: parseOptionalDate(url.searchParams.get("to") ?? undefined),
    };
    csv =
      resource === "payments"
        ? await exportAdminPaymentsCsv(filters)
        : await exportAdminMandatesCsv(filters);
    metadata = {
      resource,
      ...filters,
      from: filters.from?.toISOString() ?? null,
      to: filters.to?.toISOString() ?? null,
    };
  }

  await writeAuditEvent({
    actorUserId: authz.userId,
    action: AuditActions.REPORT_EXPORTED,
    entityType: "export",
    entityId: resource,
    metadata,
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rjgc-${resource}-export.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
