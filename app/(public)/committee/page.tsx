import { CommitteeDirectory } from "@/components/committee";
import { PublicPageShell } from "@/components/public";
import { committeePageCopy } from "@/content/committee";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Committee",
  description: committeePageCopy.description,
  alternates: { canonical: "/committee" },
  openGraph: {
    title: `Committee · ${siteConfig.name}`,
    description: committeePageCopy.description,
    url: "/committee",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CommitteePage() {
  return (
    <PublicPageShell pageKey="committee">
      <CommitteeDirectory />
    </PublicPageShell>
  );
}
