import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  buildReport,
  reportToCsv,
  ReportTypes,
} from "@/server/reports/report-service";

const prisma = new PrismaClient();
const suffix = `r${Date.now().toString(36)}`;

describe("operational reports", () => {
  let memberId: string;

  beforeAll(async () => {
    const member = await prisma.member.create({
      data: {
        membershipNumber: `RJGC-RPT-${suffix}`,
        firstName: "Report",
        lastName: "Sample",
        displayName: `[SAMPLE] Report Member ${suffix}`,
        email: `report.${suffix}@rjgc.local`,
        status: "ACTIVE",
        isSample: true,
        city: "Rishra",
      },
    });
    memberId = member.id;

    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 2500,
        status: "SUCCESS",
        method: "MANDATE",
        paidAt: new Date(),
        provider: "mock",
        providerPaymentRef: `pay_rpt_${suffix}`,
        isSample: true,
      },
    });

    await prisma.payment.create({
      data: {
        memberId,
        amountPaise: 2500,
        status: "FAILED",
        method: "MANDATE",
        provider: "mock",
        providerPaymentRef: `pay_fail_${suffix}`,
        notes: "Sample failed debit",
        isSample: true,
      },
    });

    await prisma.paymentMandate.create({
      data: {
        memberId,
        status: "ACTIVE",
        provider: "mock",
        providerMandateRef: `mandate_rpt_${suffix}`,
        amountPaise: 2500,
        isSample: true,
      },
    });

    await prisma.invoice.create({
      data: {
        memberId,
        number: `INV-RPT-${suffix}`,
        amountPaise: 2500,
        status: "OVERDUE",
        dueOn: new Date(),
        isSample: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.invoice.deleteMany({ where: { memberId } });
    await prisma.paymentMandate.deleteMany({ where: { memberId } });
    await prisma.payment.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });
    await prisma.$disconnect();
  });

  it("builds every report type and CSV export", async () => {
    for (const type of ReportTypes) {
      const report = await buildReport(type);
      expect(report.type).toBe(type);
      expect(report.headers.length).toBeGreaterThan(0);
      const csv = reportToCsv(report);
      expect(csv.split("\n")[0]).toContain(report.headers[0]!);
      expect(csv).not.toMatch(/cvv|password|upi[_-]?pin/i);
    }
  });

  it("includes sample member and payment rows", async () => {
    const members = await buildReport("members");
    expect(
      members.rows.some((row) => row[0] === `RJGC-RPT-${suffix}`),
    ).toBe(true);

    const collection = await buildReport("payment-collection");
    expect(collection.rows.length).toBeGreaterThan(0);

    const failed = await buildReport("failed-payments");
    expect(
      failed.rows.some((row) => String(row[4]).includes(`pay_fail_${suffix}`)),
    ).toBe(true);
  });
});
