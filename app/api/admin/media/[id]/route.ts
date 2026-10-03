import { auth } from "@/server/auth";
import {
  AuthorizationError,
  assertAuthenticated,
  assertPermission,
} from "@/server/auth/authorize";
import { Permissions } from "@/server/domain/permissions";
import {
  assertCanReadPurpose,
  assertCanUploadPurpose,
} from "@/server/media/authorize-purpose";
import {
  MEDIA_VARIANTS,
  type MediaPurposeValue,
  type MediaVariantName,
} from "@/server/media/types";
import { prisma } from "@/server/db/prisma";
import {
  MediaServiceError,
  loadVariantBytes,
  softDeleteMediaAsset,
  updateMediaMetadata,
} from "@/server/services/media-service";
import { apiErrorResponse } from "@/server/observability/errors";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function isVariant(value: string): value is MediaVariantName {
  return (MEDIA_VARIANTS as readonly string[]).includes(value);
}

async function requireMediaMutator(assetPurpose: MediaPurposeValue) {
  const session = await auth();
  assertAuthenticated(session?.user?.id);
  assertPermission(session!.user.role, Permissions.ADMIN_ACCESS);
  assertCanUploadPurpose(session!.user.role, assetPurpose);
  return session!;
}

/** Authenticated preview of READY assets the caller may read by purpose. */
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    assertAuthenticated(session?.user?.id);
    assertPermission(session!.user.role, Permissions.ADMIN_ACCESS);

    const { id } = await context.params;
    if (!/^[a-z0-9]+$/i.test(id)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const asset = await prisma.mediaAsset.findFirst({
      where: { id, deletedAt: null },
      select: { purpose: true },
    });
    if (!asset) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    assertCanReadPurpose(
      session!.user.role,
      asset.purpose as MediaPurposeValue,
    );

    const url = new URL(request.url);
    const variantRaw = url.searchParams.get("v") ?? "md";
    if (!isVariant(variantRaw)) {
      return NextResponse.json({ error: "Invalid variant." }, { status: 400 });
    }

    const payload = await loadVariantBytes(id, variantRaw, {
      requirePublic: false,
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
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return apiErrorResponse(error, {
        route: "/api/admin/media/[id]",
        method: "GET",
      });
    }
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.mediaAsset.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const session = await requireMediaMutator(
      existing.purpose as MediaPurposeValue,
    );
    const body = (await request.json()) as {
      alt?: string;
      caption?: string | null;
      historicallyImportant?: boolean;
    };
    const row = await updateMediaMetadata(id, body, session.user.id);
    return NextResponse.json({
      id: row.id,
      alt: row.alt,
      caption: row.caption,
      historicallyImportant: row.historicallyImportant,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return apiErrorResponse(error, {
        route: "/api/admin/media/[id]",
        method: "PATCH",
      });
    }
    if (error instanceof MediaServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error, {
      route: "/api/admin/media/[id]",
      method: "PATCH",
    });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.mediaAsset.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const session = await requireMediaMutator(
      existing.purpose as MediaPurposeValue,
    );
    await softDeleteMediaAsset(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return apiErrorResponse(error, {
        route: "/api/admin/media/[id]",
        method: "DELETE",
      });
    }
    if (error instanceof MediaServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error, {
      route: "/api/admin/media/[id]",
      method: "DELETE",
    });
  }
}
