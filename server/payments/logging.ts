import { createScopedLog } from "@/server/observability/logger";

/** Backward-compatible payment logger backed by structured observability. */
export const paymentLog = createScopedLog("payments");
