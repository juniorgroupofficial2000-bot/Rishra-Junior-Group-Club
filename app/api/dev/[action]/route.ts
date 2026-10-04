import { developerUtilitiesNotFoundResponse } from "@/server/dev/guard";
import {
  runDeveloperUtility,
  type DeveloperUtilityAction,
} from "@/server/dev/utilities";
import { Permissions } from "@/server/domain/permissions";
import { requireApiPermission } from "@/server/auth/api-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ACTIONS = new Set<DeveloperUtilityAction>([
  "seed",
  "reset",
  "create-test-member",
  "create-test-event",
  "create-test-announcement",
  "test-notification",
  "test-payment-webhook",
]);

type RouteContext = {
  params: Promise<{ action: string }>;
};

/**
 * Development/staging-only utilities.
 * Production always returns 404 (not 403) — do not merely hide UI.
 */
export async function POST(request: Request, context: RouteContext) {
  const blocked = developerUtilitiesNotFoundResponse();
  if (blocked) return blocked;

  const auth = await requireApiPermission(Permissions.SETTINGS_WRITE);
  if (auth instanceof NextResponse) return auth;

  const { action: raw } = await context.params;
  if (!ACTIONS.has(raw as DeveloperUtilityAction)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await request.json().catch(() => null);
    const result = await runDeveloperUtility(
      raw as DeveloperUtilityAction,
      auth.userId,
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Developer utility failed.",
      },
      { status: 400 },
    );
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const blocked = developerUtilitiesNotFoundResponse();
  if (blocked) return blocked;

  const { action: raw } = await context.params;
  if (!ACTIONS.has(raw as DeveloperUtilityAction)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    action: raw,
    method: "POST",
    note: "POST with an authenticated staff session (SETTINGS_WRITE).",
  });
}
