/**
 * Whether SAMPLE / demo content may appear on public surfaces.
 * Production defaults to OFF. Set CONTENT_INCLUDE_SAMPLE=true only for demos.
 */
export function includeSampleContent(): boolean {
  const flag = process.env.CONTENT_INCLUDE_SAMPLE?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV !== "production";
}

export function isSampleProvenance(
  provenance: "verified" | "sample" | "placeholder" | string,
): boolean {
  return provenance === "sample";
}
