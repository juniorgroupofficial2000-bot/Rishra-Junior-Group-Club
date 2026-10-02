import type {
  MemberDashboardSnapshot,
  MemberRepository,
  PaymentRecord,
} from "@/server/repositories/contracts/member-repository";

/**
 * DEMO / MOCK member portal data — SAMPLE records only.
 * Does not process payments or create real mandates.
 */

const DEMO_MEMBER_ID = "mem_demo_001";
const DEMO_USER_ID = "user_demo_member";

const payments: PaymentRecord[] = [
  {
    id: "pay_sample_1",
    memberId: DEMO_MEMBER_ID,
    amountLabel: "[SAMPLE] ₹ —",
    paidOn: "2025-11-01",
    status: "recorded",
    methodLabel: "[SAMPLE] Offline / bank transfer",
    receiptNumber: "RJGC-RCPT-SAMPLE-001",
    isSample: true,
  },
  {
    id: "pay_sample_2",
    memberId: DEMO_MEMBER_ID,
    amountLabel: "[SAMPLE] ₹ —",
    paidOn: null,
    status: "pending_verification",
    methodLabel: "[SAMPLE] Awaiting verification",
    receiptNumber: null,
    isSample: true,
  },
];

function profile() {
  return {
    id: DEMO_MEMBER_ID,
    userId: DEMO_USER_ID,
    membershipNumber: "RJGC-DEMO-001",
    displayName: "Demo Member",
    email: "member@rjgc.local",
    phoneMasked: "+91 ••••• ••321",
    status: "active" as const,
    joinedOn: "2024-01-15",
    addressLine: "[SAMPLE] Address on file — not shown publicly",
  };
}

function membership() {
  return {
    memberId: DEMO_MEMBER_ID,
    planLabel: "[SAMPLE] Regular membership",
    status: "active" as const,
    billingCycleLabel: "[SAMPLE] Monthly",
    duesAmountLabel: "[SAMPLE] Amount not published",
    nextDueOn: "2026-04-01",
  };
}

function mandate() {
  return {
    memberId: DEMO_MEMBER_ID,
    status: "not_setup" as const,
    providerLabel: "Payment provider (not connected)",
    lastUpdatedOn: null,
    note: "E-mandate setup is not available in this demo. No payment provider calls are made.",
  };
}

export const mockMemberRepository: MemberRepository = {
  async getProfileByUserId(userId) {
    if (userId !== DEMO_USER_ID) return null;
    return profile();
  },
  async getMembership(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return null;
    return membership();
  },
  async getMandate(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return null;
    return mandate();
  },
  async getPayments(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return [];
    return payments;
  },
  async getReceipts(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return [];
    return payments.filter((p) => p.receiptNumber && p.status === "recorded");
  },
  async getUpcomingEvents(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return [];
    return [
      {
        id: "mevt_1",
        title: "[SAMPLE] Saraswati Puja gathering",
        startsAt: "2026-02-01T09:00:00+05:30",
        venueLabel: "Club premises, Rishra",
        href: "/events/sample-saraswati-puja-gathering",
      },
    ];
  },
  async getAnnouncements(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return [];
    return [
      {
        id: "mann_1",
        title: "[SAMPLE] Welcome to the digital platform",
        publishedAt: "2026-01-15",
        href: "/announcements/sample-welcome-to-the-digital-platform",
        pinned: true,
      },
    ];
  },
  async getAttendance(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return [];
    return [
      {
        id: "att_1",
        eventTitle: "[SAMPLE] Cultural evening",
        occurredOn: "2024-11-16",
        status: "present",
      },
    ];
  },
  async getNotifications(memberId) {
    if (memberId !== DEMO_MEMBER_ID) return [];
    return [
      {
        id: "ntf_1",
        title: "[SAMPLE] Portal access enabled",
        body: "This is a demo notification. Production notifications will be delivered through the notification provider abstraction.",
        createdAt: "2026-01-20T10:00:00+05:30",
        read: false,
      },
    ];
  },
  async getDashboard(userId): Promise<MemberDashboardSnapshot | null> {
    const memberProfile = await this.getProfileByUserId(userId);
    if (!memberProfile) return null;
    const memberId = memberProfile.id;
    const [membershipInfo, mandateInfo, recentPayments, upcomingEvents, announcements] =
      await Promise.all([
        this.getMembership(memberId),
        this.getMandate(memberId),
        this.getPayments(memberId),
        this.getUpcomingEvents(memberId),
        this.getAnnouncements(memberId),
      ]);
    if (!membershipInfo || !mandateInfo) return null;
    return {
      profile: memberProfile,
      membership: membershipInfo,
      currentDuesLabel: membershipInfo.duesAmountLabel,
      nextPaymentOn: membershipInfo.nextDueOn,
      mandate: mandateInfo,
      recentPayments: recentPayments.slice(0, 5),
      upcomingEvents,
      announcements,
    };
  },
};
