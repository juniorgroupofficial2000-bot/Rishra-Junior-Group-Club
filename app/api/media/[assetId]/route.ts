import { MEDIA_VARIANTS, type MediaVariantName } from "@/server/media/types";
import { loadVariantBytes } from "@/server/services/media-service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ assetId: string }> };

function isVariant(value: string): value is MediaVariantName {
  return (MEDIA_VARIANTS as readonly string[]).includes(value);
}

/**
 * Public delivery of READY media variants from object storage.
 * Content-Type is taken from stored metadata (never from user filename).
 * X-Content-Type-Options: nosniff prevents executable interpretation.
 */
export async function GET(request: Request, context: RouteContext) {
  const { assetId } = await context.params;
  if (!/^[a-z0-9]+$/i.test(assetId)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const variantRaw = url.searchParams.get("v") ?? "md";
  if (!isVariant(variantRaw)) {
    return NextResponse.json({ error: "Invalid variant." }, { status: 400 });
  }

  // Public route: published / slotted assets only (drafts → 404).
  const payload = await loadVariantBytes(assetId, variantRaw, {
    requirePublic: true,
  });
  if (!payload) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(payload.body), {
    status: 200,
    headers: {
      "Content-Type": payload.contentType,
      "Content-Length": String(payload.body.length),
      "Cache-Control": payload.cacheControl,
      "CDN-Cache-Control": payload.cacheControl,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
      Vary: "Accept",
    },
  });
}
