import { EnvironmentRibbon } from "@/components/env/environment-badge";
import { MemberShell } from "@/components/member/member-shell";
import { ToastProvider } from "@/components/ui/toast";
import { getPublicEnv } from "@/config/public";
import { siteConfig } from "@/content/site";
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
  const { appEnv, appName } = getPublicEnv();

  return (
    <ToastProvider>
      <EnvironmentRibbon
        appEnv={appEnv}
        brandName={(appName || siteConfig.name).toUpperCase()}
      />
      <MemberShell
        userName={session.user.name ?? session.user.email ?? "Member"}
      >
        {children}
      </MemberShell>
    </ToastProvider>
  );
}
