import { Badge } from "@/components/ui/badge";
import type { ContentProvenance } from "@/content/heritage";

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
  if (provenance === "verified") return null;
  return <Badge variant={variants[provenance]}>{labels[provenance]}</Badge>;
}
