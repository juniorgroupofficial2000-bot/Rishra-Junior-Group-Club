import { Permissions, hasPermission } from "@/server/domain/permissions";
import { auth } from "@/server/auth";
import {
  ReportTypes,
  buildReport,
  reportToCsv,
  type ReportType,
} from "@/server/reports/report-service";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, Permissions.REPORTS_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type } = await context.params;
  if (!(ReportTypes as readonly string[]).includes(type)) {
    return NextResponse.json({ error: "Unknown report type." }, { status: 404 });
  }

  const report = await buildReport(type as ReportType);
  const csv = reportToCsv(report);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rjgc-${type}-report.csv"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
