export type MemberNavItem = {
  href: string;
  label: string;
};

export const memberNav: MemberNavItem[] = [
  { href: "/member/dashboard", label: "Dashboard" },
  { href: "/member/profile", label: "Profile" },
  { href: "/member/membership", label: "Membership" },
  { href: "/member/payments", label: "Payments" },
  { href: "/member/mandate", label: "Mandate" },
  { href: "/member/receipts", label: "Receipts" },
  { href: "/member/events", label: "Events" },
  { href: "/member/attendance", label: "Attendance" },
  { href: "/member/notifications", label: "Notifications" },
  { href: "/member/settings", label: "Settings" },
];
