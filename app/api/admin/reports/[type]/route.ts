import { AuditActions } from "@/server/audit/actions";
import { requireApiPermission } from "@/server/auth/api-auth";
import { Permissions } from "@/server/domain/permissions";
import {
  ReportTypes,
  buildReport,
  reportToCsv,
  type ReportType,
} from "@/server/reports/report-service";
import { writeAuditEvent } from "@/server/services/audit-service";
import { apiErrorResponse } from "@/server/observability/errors";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const authz = await requireApiPermission(Permissions.REPORTS_VIEW);
  if (authz instanceof NextResponse) {
    return authz;
  }

  try {
    // Bound bulk PII export frequency per staff user (in-process; pair with edge WAF in prod).
    if (!consumeRateLimit(`report-export:${authz.userId}`, 10, 15 * 60_000)) {
      return NextResponse.json(
        { error: "Too many report exports." },
        { status: 429 },
      );
    }

    const { type } = await context.params;
    if (!(ReportTypes as readonly string[]).includes(type)) {
      return NextResponse.json({ error: "Unknown report type." }, { status: 404 });
    }

    const report = await buildReport(type as ReportType);
    const csv = reportToCsv(report);

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    await writeAuditEvent({
      actorUserId: authz.userId,
      action: AuditActions.REPORT_EXPORTED,
      entityType: "report",
      entityId: type,
      metadata: {
        reportType: type,
        rowCount: report.rows.length,
      },
      ipAddress: clientIp,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rjgc-${type}-report.csv"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiErrorResponse(error, {
      route: "/api/admin/reports/[type]",
      method: "GET",
      userId: authz.userId,
    });
  }
}
