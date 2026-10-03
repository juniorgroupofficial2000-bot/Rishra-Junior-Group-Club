import { describe, expect, it } from "vitest";
import { generateTotpSecret, verifyTotpCode } from "@/server/auth/mfa/totp";
import { createHmac } from "node:crypto";

function hotp(secretBase32: string, counter: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = secretBase32.replace(/=+$/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    const idx = alphabet.indexOf(char);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  const secret = Buffer.from(bytes);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

describe("TOTP", () => {
  it("verifies a code for the current time step", () => {
    const secret = generateTotpSecret();
    const nowMs = Date.UTC(2026, 0, 1, 12, 0, 0);
    const step = Math.floor(nowMs / 1000 / 30);
    const code = hotp(secret, step);
    expect(verifyTotpCode(secret, code, { nowMs })).toBe(true);
    expect(verifyTotpCode(secret, "000000", { nowMs })).toBe(false);
  });
});
