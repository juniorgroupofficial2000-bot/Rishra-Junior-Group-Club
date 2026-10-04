import type { PrismaClient } from "@prisma/client";
import { assertDestructiveOpAllowed } from "@/config/destructive-ops";

/**
 * Enables hard-delete / audit mutation bypass for the current DB session.
 * Production application code must never call this.
 * Used only by demo seed and automated tests that tear down SAMPLE rows.
 */
export async function allowFinancialHardDelete(
  client: Pick<PrismaClient, "$executeRawUnsafe">,
): Promise<void> {
  assertDestructiveOpAllowed("financial_hard_delete");

  await client.$executeRawUnsafe(
    `SELECT set_config('app.allow_financial_delete', 'on', false)`,
  );
}
