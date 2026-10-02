import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/content/site";
import { isMockRepositoryDriver } from "@/server/repositories";
import { safeInternalPath } from "@/server/security/safe-path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Secure member sign-in for ${siteConfig.name}.`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const callbackUrl = safeInternalPath(params.callbackUrl);
  // Demo credentials are only shown for the intentional mock repository driver.
  const showDemoHint = isMockRepositoryDriver();

  return (
    <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
        Club portal
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Access the member or admin portal. Sessions are secured with encrypted
        cookies and server-side authorization.
      </p>
      <div className="mt-8">
        <LoginForm
          callbackUrl={callbackUrl}
          errorCode={params.error}
          showDemoHint={showDemoHint}
        />
      </div>
    </div>
  );
}
