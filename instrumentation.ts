import type { Instrumentation } from "next";

/**
 * Server boot + request error hooks for production observability.
 * Structured logs go to stdout as JSON (see docs/observability.md).
 *
 * Important: do not throw from `register()` on Vercel. A thrown boot error
 * becomes an opaque Next.js 500 with no operator guidance. Capture the
 * config problem and let the root layout render a setup panel instead.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnvironmentConfig, describeAppEnv, getServerEnv } =
      await import("@/config");
    const { setBootConfigError } = await import("@/config/boot-status");
    const { appLog } = await import("@/server/observability/logger");

    let hasBootConfigError = false;
    try {
      assertEnvironmentConfig();
      setBootConfigError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid environment configuration.";
      const env = getServerEnv();
      hasBootConfigError = true;
      setBootConfigError(message);
      appLog.error("app", "environment_config_invalid", {
        appEnv: env.appEnv,
        errorMessage: message,
      });
    }

    const env = getServerEnv();
    appLog.info("app", "server_register", {
      runtime: "nodejs",
      appEnv: env.appEnv,
      appEnvLabel: describeAppEnv(env.appEnv),
      nodeEnv: env.NODE_ENV,
      logLevel: env.logLevel,
      bootConfigError: hasBootConfigError,
    });
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const { appLog } = await import("@/server/observability/logger");
  const { errorMessage, errorName } = await import(
    "@/server/observability/redact"
  );
  const { isPrismaError } = await import("@/server/observability/errors");

  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest?: unknown }).digest)
      : undefined;

  appLog.error("app", "request_error", {
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    digest,
    errorName: errorName(err),
    errorMessage: errorMessage(err),
    isPrisma: isPrismaError(err),
  });
};
