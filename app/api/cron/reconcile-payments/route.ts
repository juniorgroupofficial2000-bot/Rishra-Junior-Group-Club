import { reconcileStalePendingPayments } from "@/server/payments/payment-service";
import { appLog } from "@/server/observability/logger";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Ops cron endpoint for delayed webhook recovery.
 * Authorize with Authorization: Bearer $CRON_SECRET
 */
export async function POST(request: Request) {
  const { getServerEnv } = await import("@/config");
  const secret = getServerEnv().CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !safeEqualString(token, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const results = await reconcileStalePendingPayments();
    const scanned = results.length;
    const updated = results.filter((r) => r.outcome === "updated").length;
    const errors = results.filter((r) => r.outcome === "error").length;
    appLog.info("payments", "reconcile_cron_complete", {
      scanned,
      updated,
      errors,
    });
    return NextResponse.json({ ok: true, scanned, updated, errors });
  } catch (error) {
    appLog.exception("payments", "reconcile_cron_failed", error);
    return NextResponse.json(
      { error: "Reconciliation failed." },
      { status: 500 },
    );
  }
}
