import "server-only";

import {
  allowsDeveloperUtilities,
  resolveAppEnv,
} from "@/config/app-env";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

/** Page / server-action guard — production returns a normal 404. */
export function assertDeveloperUtilitiesPage(): void {
  if (!allowsDeveloperUtilities(resolveAppEnv())) {
    notFound();
  }
}

/** API guard — production returns HTTP 404 (not 403). */
export function developerUtilitiesNotFoundResponse(): NextResponse | null {
  if (!allowsDeveloperUtilities(resolveAppEnv())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export function isDeveloperUtilitiesEnabled(
  source: NodeJS.ProcessEnv = process.env,
): boolean {
  return allowsDeveloperUtilities(resolveAppEnv(source));
}
