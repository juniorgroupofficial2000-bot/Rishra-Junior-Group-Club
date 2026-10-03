"use server";

import { assertDeveloperUtilitiesPage } from "@/server/dev/guard";
import {
  runDeveloperUtility,
  type DeveloperUtilityAction,
} from "@/server/dev/utilities";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

const ACTIONS: DeveloperUtilityAction[] = [
  "seed",
  "reset",
  "create-test-member",
  "create-test-event",
  "create-test-announcement",
  "test-notification",
  "test-payment-webhook",
];

function parseAction(raw: FormDataEntryValue | null): DeveloperUtilityAction {
  const value = typeof raw === "string" ? raw : "";
  if ((ACTIONS as string[]).includes(value)) {
    return value as DeveloperUtilityAction;
  }
  throw new Error("Unknown developer utility action.");
}

export type DeveloperActionState = {
  ok: boolean;
  message: string;
  details?: Record<string, string | number | boolean | null>;
};

export async function runDeveloperUtilityAction(
  _prev: DeveloperActionState | null,
  formData: FormData,
): Promise<DeveloperActionState> {
  assertDeveloperUtilitiesPage();
  const session = await requirePermission(
    Permissions.SETTINGS_WRITE,
    "/admin/developer",
  );

  try {
    const action = parseAction(formData.get("action"));
    const result = await runDeveloperUtility(action, session.user.id);
    revalidatePath("/admin/developer");
    revalidatePath("/admin/members");
    revalidatePath("/admin/events");
    revalidatePath("/admin/announcements");
    return {
      ok: true,
      message: result.message,
      details: result.details,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Developer utility failed.",
    };
  }
}
