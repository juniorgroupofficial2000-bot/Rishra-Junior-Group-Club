import { describe, expect, it } from "vitest";
import {
  buildAdminMandatesCsv,
  buildAdminPaymentsCsv,
} from "@/server/services/admin-list-service";

describe("admin payment/mandate CSV export", () => {
  it("neutralizes formula injection in payment export cells", () => {
    const csv = buildAdminPaymentsCsv([
      {
        id: "pay_1",
        memberName: '=HYPERLINK("http://evil","x")',
        membershipNumber: "+123",
        amountLabel: "₹1.00",
        status: "SUCCESS",
        method: "UPI",
        paidAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        receiptNumber: "@SUM(A1)",
        invoiceNumber: "INV-1",
        providerPaymentRef: "-1+1",
      },
    ]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+123");
    expect(csv).toContain("'@SUM(A1)");
    expect(csv).toContain("'-1+1");
    for (const line of csv.split("\n").slice(1)) {
      expect(line.startsWith("=")).toBe(false);
      expect(line.startsWith("+")).toBe(false);
      expect(line.startsWith("@")).toBe(false);
    }
  });

  it("neutralizes formula injection in mandate export cells", () => {
    const csv = buildAdminMandatesCsv([
      {
        id: "man_1",
        memberName: "=CMD()",
        membershipNumber: "RJGC-1",
        status: "ACTIVE",
        amountLabel: "₹1.00",
        provider: "razorpay",
        providerMandateRef: "+cmd",
        nextDebitAt: null,
        lastStatusAt: null,
      },
    ]);
    expect(csv).toContain("'=CMD()");
    expect(csv).toContain("'+cmd");
  });
});
