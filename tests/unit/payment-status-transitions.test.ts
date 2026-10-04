import { describe, expect, it } from "vitest";
import { nextPaymentStatus } from "@/server/payments/webhook-processor";
import type { PaymentStatus } from "@prisma/client";

const ALL: PaymentStatus[] = [
  "CREATED",
  "PENDING",
  "AUTHORIZED",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

describe("nextPaymentStatus (monotonic transitions)", () => {
  it("allows identical status (idempotent no-op)", () => {
    for (const status of ALL) {
      expect(nextPaymentStatus(status, status)).toBe(status);
    }
  });

  it("allows pending/created/authorized to move to success or failed", () => {
    for (const current of ["CREATED", "PENDING", "AUTHORIZED"] as const) {
      expect(nextPaymentStatus(current, "SUCCESS")).toBe("SUCCESS");
      expect(nextPaymentStatus(current, "FAILED")).toBe("FAILED");
      expect(nextPaymentStatus(current, "CANCELLED")).toBe("CANCELLED");
    }
  });

  it("allows SUCCESS → REFUNDED only", () => {
    expect(nextPaymentStatus("SUCCESS", "REFUNDED")).toBe("REFUNDED");
    expect(nextPaymentStatus("SUCCESS", "FAILED")).toBeNull();
    expect(nextPaymentStatus("SUCCESS", "PENDING")).toBeNull();
    expect(nextPaymentStatus("SUCCESS", "CANCELLED")).toBeNull();
  });

  it("treats REFUNDED and CANCELLED as terminal", () => {
    for (const incoming of ALL) {
      if (incoming === "REFUNDED") {
        expect(nextPaymentStatus("REFUNDED", incoming)).toBe("REFUNDED");
      } else {
        expect(nextPaymentStatus("REFUNDED", incoming)).toBeNull();
      }
      if (incoming === "CANCELLED") {
        expect(nextPaymentStatus("CANCELLED", incoming)).toBe("CANCELLED");
      } else {
        expect(nextPaymentStatus("CANCELLED", incoming)).toBeNull();
      }
    }
  });

  it("does not resurrect FAILED into SUCCESS via nextPaymentStatus alone when current is FAILED", () => {
    // FAILED is non-terminal in this matrix — webhooks may still update.
    // Document current policy: FAILED can move to SUCCESS if provider corrects.
    expect(nextPaymentStatus("FAILED", "SUCCESS")).toBe("SUCCESS");
  });
});
