import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveAppEnv, type AppEnv } from "@/config/app-env";

const API_VERSION = "v1";

export type RuntimeBuildInfo = {
  appEnv: AppEnv;
  version: string;
  commitSha: string | null;
  commitShort: string | null;
  buildTimestamp: string | null;
  apiVersion: string;
};

function readPackageVersion(): string {
  try {
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version?.trim() || "0.0.0";
  } catch {
    return process.env.npm_package_version?.trim() || "0.0.0";
  }
}

function resolveCommitSha(source: NodeJS.ProcessEnv): string | null {
  const candidates = [
    source.GIT_COMMIT_SHA,
    source.VERCEL_GIT_COMMIT_SHA,
    source.GITHUB_SHA,
    source.COMMIT_REF,
    source.NEXT_PUBLIC_GIT_COMMIT_SHA,
  ];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/**
 * Non-secret build / release metadata for admin diagnostics.
 * Never includes credentials, tokens, or connection strings.
 */
export function getRuntimeBuildInfo(
  source: NodeJS.ProcessEnv = process.env,
): RuntimeBuildInfo {
  const commitSha = resolveCommitSha(source);
  return {
    appEnv: resolveAppEnv(source),
    version:
      source.APP_VERSION?.trim() ||
      source.NEXT_PUBLIC_APP_VERSION?.trim() ||
      readPackageVersion(),
    commitSha,
    commitShort: commitSha ? commitSha.slice(0, 7) : null,
    buildTimestamp:
      source.BUILD_TIMESTAMP?.trim() ||
      source.NEXT_PUBLIC_BUILD_TIMESTAMP?.trim() ||
      null,
    apiVersion: source.API_VERSION?.trim() || API_VERSION,
  };
}
