import "server-only";

import { getServerEnv } from "@/config";
import { PrismaClient } from "@prisma/client";
import { logDatabaseFailure } from "@/server/observability/events";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Environment fail-closed checks run from `instrumentation.register()`.
 * Do not assert at module import — that turns every Prisma import into a hard
 * 500 before public loaders can degrade gracefully when the DB is unset.
 */

function createPrismaClient() {
  const env = getServerEnv();
  const client = new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      ...(env.appEnv === "local" || env.appEnv === "development"
        ? ([{ emit: "event", level: "warn" }] as const)
        : []),
    ],
  });

  client.$on("error", (event) => {
    logDatabaseFailure({
      error: new Error(event.message),
      fields: { target: event.target },
    });
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (getServerEnv().NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
