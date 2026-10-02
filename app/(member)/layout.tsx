import { MemberShell } from "@/components/member/member-shell";
import { privatePageMetadata } from "@/lib/seo/metadata";
import { requireMemberSession } from "@/server/auth/session";
import type { ReactNode } from "react";

export const metadata = privatePageMetadata(
  "Member portal",
  "Secure member portal for Rishra Junior Group Club.",
);

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
