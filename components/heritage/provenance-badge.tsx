import { Badge } from "@/components/ui/badge";
import type { ContentProvenance } from "@/content/shared/media";

const labels: Record<ContentProvenance, string> = {
  verified: "Verified",
  sample: "SAMPLE",
  placeholder: "Placeholder",
};

const variants: Record<
  ContentProvenance,
  "success" | "heritage" | "neutral"
> = {
  verified: "success",
  sample: "heritage",
  placeholder: "neutral",
};

export function ProvenanceBadge({
  provenance,
}: {
  provenance: ContentProvenance;
}) {
  // Verified and unpublished-placeholder content stay quiet on public pages.
  // SAMPLE is labelled so demo data is never mistaken for club fact.
  if (provenance === "verified" || provenance === "placeholder") return null;
  return <Badge variant={variants[provenance]}>{labels[provenance]}</Badge>;
}
