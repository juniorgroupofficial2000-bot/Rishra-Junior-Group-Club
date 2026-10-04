import { auth } from "@/server/auth";
import {
  AuthorizationError,
  assertAuthenticated,
  assertPermission,
} from "@/server/auth/authorize";
import { Permissions } from "@/server/domain/permissions";
import { assertCanUploadPurpose } from "@/server/media/authorize-purpose";
import type { MediaVariantsMap } from "@/server/media/types";
import { resolveMediaUrl } from "@/server/media/urls";
import {
  MediaValidationError,
  isMediaPurpose,
} from "@/server/media/validation";
import {
  MediaServiceError,
  uploadImageAsset,
} from "@/server/services/media-service";
import { apiErrorResponse } from "@/server/observability/errors";
import { logAuthzFailure } from "@/server/observability/events";
import { staffNeedsMfaEnrollment } from "@/server/auth/mfa/policy";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FORM_BYTES = 9 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session?.user?.id);
    assertPermission(session!.user.role, Permissions.ADMIN_ACCESS);
    if (
      staffNeedsMfaEnrollment({
        role: session!.user.role,
        mfaEnabled: Boolean(session!.user.mfaEnabled),
      })
    ) {
      return NextResponse.json(
        {
          error: "Staff MFA enrollment is required.",
          code: "MFA_REQUIRED",
        },
        { status: 403 },
      );
    }

    if (
      !consumeRateLimit(`media-upload:${session!.user.id}`, 30, 60 * 60_000)
    ) {
      return NextResponse.json(
        { error: "Too many uploads. Try again later." },
        { status: 429 },
      );
    }

    const lengthHeader = request.headers.get("content-length");
    if (lengthHeader == null || lengthHeader === "") {
      return NextResponse.json(
        { error: "Content-Length is required for uploads." },
        { status: 411 },
      );
    }
    const contentLength = Number(lengthHeader);
    if (
      !Number.isFinite(contentLength) ||
      contentLength <= 0 ||
      contentLength > MAX_FORM_BYTES
    ) {
      return NextResponse.json({ error: "Upload too large." }, { status: 413 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }
    if (file.size > MAX_FORM_BYTES) {
      return NextResponse.json({ error: "Upload too large." }, { status: 413 });
    }

    const purposeRaw = String(form.get("purpose") ?? "GENERAL");
    if (!isMediaPurpose(purposeRaw)) {
      return NextResponse.json({ error: "Invalid purpose." }, { status: 400 });
    }

    assertCanUploadPurpose(session!.user.role, purposeRaw);

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await uploadImageAsset({
      buffer,
      filename: file.name || "upload",
      declaredMime: file.type || null,
      purpose: purposeRaw,
      alt: String(form.get("alt") ?? ""),
      caption: form.get("caption") != null ? String(form.get("caption")) : null,
      historicallyImportant: form.get("historicallyImportant") === "true",
      slotKey: form.get("slotKey") != null ? String(form.get("slotKey")) : null,
      actorUserId: session!.user.id,
    });

    return NextResponse.json({
      id: asset.id,
      purpose: asset.purpose,
      alt: asset.alt,
      caption: asset.caption,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      url: resolveMediaUrl({
        assetId: asset.id,
        variants: asset.variants as MediaVariantsMap,
        variant: "md",
      }),
      thumbUrl: resolveMediaUrl({
        assetId: asset.id,
        variants: asset.variants as MediaVariantsMap,
        variant: "thumb",
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logAuthzFailure({
        code: error.code,
        permission: Permissions.ADMIN_ACCESS,
      });
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    if (
      error instanceof MediaServiceError ||
      error instanceof MediaValidationError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error, {
      route: "/api/admin/media/upload",
      method: "POST",
    });
  }
}
