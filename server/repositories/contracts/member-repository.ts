/**
 * Member portal domain models.
 * Sensitive fields stay server-side; pages receive DTOs only.
 */

export type MemberStatus = "active" | "pending" | "inactive" | "suspended";

export type MandateStatus =
  | "not_setup"
  | "pending"
  | "active"
  | "paused"
  | "cancelled"
  | "failed";

/** Historical payment record — not a live payment result. */
export type PaymentRecordStatus =
  | "recorded"
  | "pending_verification"
  | "failed"
  | "refunded";

export type MemberProfile = {
  id: string;
  userId: string;
  membershipNumber: string;
  displayName: string;
  email: string;
  phoneMasked: string;
  status: MemberStatus;
  joinedOn: string;
  addressLine: string;
};

export type MembershipInfo = {
  memberId: string;
  planLabel: string;
  status: MemberStatus;
  billingCycleLabel: string;
  /** Amounts as display strings only — no invented live pricing engine */
  duesAmountLabel: string;
  nextDueOn: string | null;
};

export type MandateInfo = {
  memberId: string;
  status: MandateStatus;
  providerLabel: string;
  lastUpdatedOn: string | null;
  note: string;
};

export type PaymentRecord = {
  id: string;
  memberId: string;
  amountLabel: string;
  paidOn: string | null;
  status: PaymentRecordStatus;
  methodLabel: string;
  receiptNumber: string | null;
  /** SAMPLE/demo provenance for mock data */
  isSample: boolean;
};

export type MemberEventItem = {
  id: string;
  title: string;
  startsAt: string;
  venueLabel: string;
  href: string;
};

export type MemberAnnouncementItem = {
  id: string;
  title: string;
  publishedAt: string;
  href: string;
  pinned: boolean;
};

export type AttendanceRecord = {
  id: string;
  eventTitle: string;
  occurredOn: string;
  status: "present" | "absent" | "registered";
};

export type MemberNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type MemberDashboardSnapshot = {
  profile: MemberProfile;
  membership: MembershipInfo;
  currentDuesLabel: string;
  nextPaymentOn: string | null;
  mandate: MandateInfo;
  recentPayments: PaymentRecord[];
  upcomingEvents: MemberEventItem[];
  announcements: MemberAnnouncementItem[];
};

export type MemberRepository = {
  getProfileByUserId(userId: string): Promise<MemberProfile | null>;
  getMembership(memberId: string): Promise<MembershipInfo | null>;
  getMandate(memberId: string): Promise<MandateInfo | null>;
  getPayments(memberId: string): Promise<PaymentRecord[]>;
  getReceipts(memberId: string): Promise<PaymentRecord[]>;
  getUpcomingEvents(memberId: string): Promise<MemberEventItem[]>;
  getAnnouncements(memberId: string): Promise<MemberAnnouncementItem[]>;
  getAttendance(memberId: string): Promise<AttendanceRecord[]>;
  getNotifications(memberId: string): Promise<MemberNotification[]>;
  getDashboard(userId: string): Promise<MemberDashboardSnapshot | null>;
};
