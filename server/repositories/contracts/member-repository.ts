/**
 * Member portal domain models.
 * Sensitive fields stay server-side; pages receive DTOs only.
 */

export type MemberStatus =
  | "application"
  | "pending"
  | "approved"
  | "active"
  | "inactive"
  | "suspended"
  | "archived";

export type MandateStatus =
  | "created"
  | "pending"
  | "active"
  | "paused"
  | "failed"
  | "cancelled"
  | "expired";

/** Payment record status mirrored from provider-confirmed states. */
export type PaymentRecordStatus =
  | "created"
  | "pending"
  | "authorized"
  | "success"
  | "failed"
  | "refunded"
  | "cancelled";

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
  duesAmountLabel: string;
  nextDueOn: string | null;
};

export type MandateInfo = {
  memberId: string;
  status: MandateStatus;
  providerLabel: string;
  lastUpdatedOn: string | null;
  nextDebitOn: string | null;
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
  isSample: boolean;
};

export type MemberEventItem = {
  id: string;
  title: string;
  startsAt: string;
  venueLabel: string;
  href: string;
  registrationRequired: boolean;
  capacity: number | null;
  registeredCount: number;
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
