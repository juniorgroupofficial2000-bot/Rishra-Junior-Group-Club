import { MemberShell } from "@/components/member/member-shell";
import { requireMemberSession } from "@/server/auth/session";
import type { ReactNode } from "react";

export default async function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireMemberSession();

  return (
    <MemberShell userName={session.user.name ?? session.user.email ?? "Member"}>
      {children}
    </MemberShell>
  );
}
