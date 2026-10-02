import { afterEach, describe, expect, it } from "vitest";
import {
  clearRateLimitBuckets,
  consumeRateLimit,
} from "@/server/security/rate-limit";

describe("consumeRateLimit", () => {
  afterEach(() => {
    clearRateLimitBuckets();
  });

  it("allows requests under the limit and blocks after", () => {
    expect(consumeRateLimit("k", 2, 60_000)).toBe(true);
    expect(consumeRateLimit("k", 2, 60_000)).toBe(true);
    expect(consumeRateLimit("k", 2, 60_000)).toBe(false);
  });
});
