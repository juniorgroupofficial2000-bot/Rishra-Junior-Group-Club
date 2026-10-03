import "server-only";

import { assertEnvironmentConfig, getServerEnv } from "@/config";
import { PrismaClient } from "@prisma/client";
import { logDatabaseFailure } from "@/server/observability/events";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fail closed early when the active APP_ENV is misconfigured.
assertEnvironmentConfig();

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
