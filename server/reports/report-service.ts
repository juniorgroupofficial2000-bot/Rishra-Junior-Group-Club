import "server-only";

import { toCsvLine } from "@/server/csv/parse-csv";
import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import type { Prisma } from "@prisma/client";

export const ReportTypes = [
  "members",
  "payment-collection",
  "outstanding-dues",
  "failed-payments",
  "mandates",
  "event-attendance",
] as const;

export type ReportType = (typeof ReportTypes)[number];

export type ReportResult = {
  type: ReportType;
  title: string;
  generatedAt: string;
  headers: string[];
  rows: Array<Array<string | number | null>>;
};

export async function buildReport(type: ReportType): Promise<ReportResult> {
  switch (type) {
    case "members":
      return buildMemberReport();
    case "payment-collection":
      return buildPaymentCollectionReport();
    case "outstanding-dues":
      return buildOutstandingDuesReport();
    case "failed-payments":
      return buildFailedPaymentReport();
    case "mandates":
      return buildMandateReport();
    case "event-attendance":
      return buildEventAttendanceReport();
    default:
      throw new Error(`Unknown report type: ${type satisfies never}`);
  }
}

export function reportToCsv(report: ReportResult): string {
  const lines = [
    toCsvLine(report.headers),
    ...report.rows.map((row) => toCsvLine(row)),
  ];
  return `${lines.join("\n")}\n`;
}

function sampleFilter(): { isSample?: boolean } {
  return process.env.NODE_ENV === "production" ? { isSample: false } : {};
}

async function buildMemberReport(): Promise<ReportResult> {
  const members = await prisma.member.findMany({
    where: { deletedAt: null, ...sampleFilter() },
    orderBy: { membershipNumber: "asc" },
    include: {
      memberships: {
        where: { deletedAt: null, isCurrent: true },
        include: { plan: true },
        take: 1,
      },
    },
  });

  return {
    type: "members",
    title: "Member report",
    generatedAt: new Date().toISOString(),
    headers: [
      "membershipNumber",
      "displayName",
      "email",
      "status",
      "plan",
      "joinedOn",
      "city",
      "isSample",
    ],
    rows: members.map((member) => [
      member.membershipNumber,
      member.displayName,
      member.email,
      member.status,
      member.memberships[0]?.plan.name ?? "",
      member.joinedOn?.toISOString().slice(0, 10) ?? "",
      member.city ?? "",
      member.isSample ? "yes" : "no",
    ]),
  };
}

async function buildPaymentCollectionReport(): Promise<ReportResult> {
  const where: Prisma.PaymentWhereInput = {
    deletedAt: null,
    status: "SUCCESS",
    ...sampleFilter(),
  };
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { paidAt: "desc" },
    include: {
      member: { select: { membershipNumber: true, displayName: true } },
      receipt: { select: { number: true } },
    },
  });

  return {
    type: "payment-collection",
    title: "Payment collection report",
    generatedAt: new Date().toISOString(),
    headers: [
      "paidOn",
      "membershipNumber",
      "memberName",
      "amount",
      "currency",
      "method",
      "providerRef",
      "receiptNumber",
    ],
    rows: payments.map((payment) => [
      payment.paidAt?.toISOString().slice(0, 10) ?? "",
      payment.member.membershipNumber,
      payment.member.displayName,
      formatAmountLabel(payment.amountPaise, payment.currency),
      payment.currency,
      payment.method,
      payment.providerPaymentRef ?? "",
      payment.receipt?.number ?? "",
    ]),
  };
}

async function buildOutstandingDuesReport(): Promise<ReportResult> {
  const where: Prisma.InvoiceWhereInput = {
    deletedAt: null,
    status: { in: ["ISSUED", "OVERDUE"] },
    ...sampleFilter(),
  };
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { dueOn: "asc" },
    include: {
      member: { select: { membershipNumber: true, displayName: true } },
    },
  });

  return {
    type: "outstanding-dues",
    title: "Outstanding dues report",
    generatedAt: new Date().toISOString(),
    headers: [
      "invoiceNumber",
      "membershipNumber",
      "memberName",
      "status",
      "amount",
      "dueOn",
      "issuedOn",
    ],
    rows: invoices.map((invoice) => [
      invoice.number,
      invoice.member.membershipNumber,
      invoice.member.displayName,
      invoice.status,
      formatAmountLabel(invoice.amountPaise, invoice.currency),
      invoice.dueOn?.toISOString().slice(0, 10) ?? "",
      invoice.issuedOn?.toISOString().slice(0, 10) ?? "",
    ]),
  };
}

async function buildFailedPaymentReport(): Promise<ReportResult> {
  const where: Prisma.PaymentWhereInput = {
    deletedAt: null,
    status: "FAILED",
    ...sampleFilter(),
  };
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      member: { select: { membershipNumber: true, displayName: true } },
      attempts: { orderBy: { attemptedAt: "desc" }, take: 1 },
    },
  });

  return {
    type: "failed-payments",
    title: "Failed payment report",
    generatedAt: new Date().toISOString(),
    headers: [
      "createdAt",
      "membershipNumber",
      "memberName",
      "amount",
      "providerRef",
      "failureCode",
      "failureMessage",
    ],
    rows: payments.map((payment) => [
      payment.createdAt.toISOString(),
      payment.member.membershipNumber,
      payment.member.displayName,
      formatAmountLabel(payment.amountPaise, payment.currency),
      payment.providerPaymentRef ?? "",
      payment.attempts[0]?.failureCode ?? "",
      payment.attempts[0]?.failureMessage ?? payment.notes ?? "",
    ]),
  };
}

async function buildMandateReport(): Promise<ReportResult> {
  const mandates = await prisma.paymentMandate.findMany({
    where: { deletedAt: null, ...sampleFilter() },
    orderBy: { updatedAt: "desc" },
    include: {
      member: { select: { membershipNumber: true, displayName: true } },
    },
  });

  return {
    type: "mandates",
    title: "Mandate report",
    generatedAt: new Date().toISOString(),
    headers: [
      "membershipNumber",
      "memberName",
      "status",
      "provider",
      "providerRef",
      "amount",
      "nextDebitAt",
      "updatedAt",
    ],
    rows: mandates.map((mandate) => [
      mandate.member.membershipNumber,
      mandate.member.displayName,
      mandate.status,
      mandate.provider ?? "",
      mandate.providerMandateRef ?? "",
      mandate.amountPaise != null
        ? formatAmountLabel(mandate.amountPaise, mandate.currency)
        : "",
      mandate.nextDebitAt?.toISOString().slice(0, 10) ?? "",
      mandate.updatedAt.toISOString(),
    ]),
  };
}

async function buildEventAttendanceReport(): Promise<ReportResult> {
  const rows = await prisma.eventAttendance.findMany({
    where: { deletedAt: null },
    orderBy: { recordedAt: "desc" },
    include: {
      event: { select: { title: true, slug: true, startsAt: true } },
      member: { select: { membershipNumber: true, displayName: true } },
    },
  });

  return {
    type: "event-attendance",
    title: "Event attendance report",
    generatedAt: new Date().toISOString(),
    headers: [
      "eventTitle",
      "eventSlug",
      "eventStartsAt",
      "membershipNumber",
      "memberName",
      "status",
      "recordedAt",
    ],
    rows: rows.map((row) => [
      row.event.title,
      row.event.slug,
      row.event.startsAt.toISOString(),
      row.member.membershipNumber,
      row.member.displayName,
      row.status,
      row.recordedAt.toISOString(),
    ]),
  };
}
