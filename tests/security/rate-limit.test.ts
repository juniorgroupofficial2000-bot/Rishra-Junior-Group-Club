import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearRateLimitBuckets,
  consumeRateLimit,
} from "@/server/security/rate-limit";

describe("consumeRateLimit", () => {
  const previousE2e = process.env.E2E_TEST;

  beforeEach(() => {
    // Rate-limit bypass must not mask unit assertions when the shell has E2E_TEST=1.
    delete process.env.E2E_TEST;
    clearRateLimitBuckets();
  });

  afterEach(() => {
    clearRateLimitBuckets();
    if (previousE2e === undefined) delete process.env.E2E_TEST;
    else process.env.E2E_TEST = previousE2e;
  });

  it("allows requests under the limit and blocks after", () => {
    expect(consumeRateLimit("k", 2, 60_000)).toBe(true);
    expect(consumeRateLimit("k", 2, 60_000)).toBe(true);
    expect(consumeRateLimit("k", 2, 60_000)).toBe(false);
  });

  it("bypasses limits when E2E_TEST=1", () => {
    process.env.E2E_TEST = "1";
    expect(consumeRateLimit("e2e-bypass", 1, 60_000)).toBe(true);
    expect(consumeRateLimit("e2e-bypass", 1, 60_000)).toBe(true);
  });
});
