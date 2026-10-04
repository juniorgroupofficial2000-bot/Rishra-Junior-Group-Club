import { createHash } from "node:crypto";
import {
  MEDIA_PURPOSES,
  type MediaPurposeValue,
} from "@/server/media/types";

/** Hard ceiling for any image upload (bytes). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Per-purpose size limits (bytes). */
export const PURPOSE_MAX_BYTES: Record<MediaPurposeValue, number> = {
  COMMITTEE_PORTRAIT: 4 * 1024 * 1024,
  MEMBER_PORTRAIT: 4 * 1024 * 1024,
  GALLERY: 8 * 1024 * 1024,
  EVENT: 6 * 1024 * 1024,
  PUJA: 8 * 1024 * 1024,
  HERO: 8 * 1024 * 1024,
  GENERAL: 5 * 1024 * 1024,
};

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export function isMediaPurpose(value: string): value is MediaPurposeValue {
  return (MEDIA_PURPOSES as readonly string[]).includes(value);
}

export function extensionForMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null;
}

/**
 * Magic-byte MIME sniffing. Rejects SVG/HTML/JS/executables even if renamed.
 * Declared Content-Type is never trusted alone.
 */
export function sniffImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.toString("ascii", 0, 6) === "GIF87a" ||
    buffer.toString("ascii", 0, 6) === "GIF89a"
  ) {
    return "image/gif";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

/** Detect dangerous / non-image payloads that must never enter the image pipeline. */
export function detectForbiddenPayload(buffer: Buffer): string | null {
  if (buffer.length === 0) return "Empty file.";

  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return "Executable files are not allowed.";
  }
  if (
    buffer[0] === 0x7f &&
    buffer[1] === 0x45 &&
    buffer[2] === 0x4c &&
    buffer[3] === 0x46
  ) {
    return "Executable files are not allowed.";
  }
  if (
    (buffer[0] === 0xcf && buffer[1] === 0xfa && buffer[2] === 0xed) ||
    (buffer[0] === 0xce && buffer[1] === 0xfa && buffer[2] === 0xed) ||
    (buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba)
  ) {
    return "Executable files are not allowed.";
  }

  const head = buffer
    .subarray(0, Math.min(buffer.length, 512))
    .toString("utf8")
    .replace(/^\uFEFF/, "")
    .trimStart()
    .toLowerCase();

  if (head.startsWith("<svg") || head.includes("<svg")) {
    return "SVG uploads are not allowed through image upload.";
  }
  if (
    head.startsWith("<!doctype html") ||
    head.startsWith("<html") ||
    head.startsWith("<script")
  ) {
    return "HTML/script uploads are not allowed.";
  }
  if (head.startsWith("<?php") || head.startsWith("<%")) {
    return "Script uploads are not allowed.";
  }
  if (head.startsWith("#!")) {
    return "Script uploads are not allowed.";
  }

  return null;
}

/**
 * Sanitize an original filename for storage metadata / key segments.
 * Strips path components, control chars, and collapses to safe kebab text.
 */
export function sanitizeOriginalFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "upload";
  const withoutNull = base.replace(/\0/g, "");
  const cleaned = withoutNull
    .normalize("NFKD")
    .replace(/[^\w.\-()+ ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : "upload";
}

/** Build a non-traversing object key under purpose/year/month/. */
export function buildSafeStorageKey(input: {
  purpose: MediaPurposeValue;
  assetId: string;
  variant: string;
  mimeType: string;
  originalFilename: string;
  now?: Date;
}): string {
  const ext = extensionForMime(input.mimeType);
  if (!ext) {
    throw new MediaValidationError("Unsupported image MIME type.");
  }
  if (!/^[a-z0-9_-]+$/i.test(input.variant)) {
    throw new MediaValidationError("Invalid variant name.");
  }
  if (!/^[a-z0-9]+$/i.test(input.assetId)) {
    throw new MediaValidationError("Invalid asset id.");
  }

  const now = input.now ?? new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName =
    sanitizeOriginalFilename(input.originalFilename)
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";

  const purpose = input.purpose.toLowerCase().replace(/_/g, "-");
  return `${purpose}/${yyyy}/${mm}/${input.assetId}/${input.variant}-${safeName}.${ext}`;
}

/** Reject object keys that attempt traversal or absolute paths. */
export function assertSafeStorageKey(key: string): void {
  if (!key || key.length > 400) {
    throw new MediaValidationError("Invalid storage key.");
  }
  if (
    key.includes("..") ||
    key.startsWith("/") ||
    key.includes("\\") ||
    key.includes("\0") ||
    /[:?*"<>|]/.test(key)
  ) {
    throw new MediaValidationError("Invalid storage key.");
  }
  if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(key)) {
    throw new MediaValidationError("Invalid storage key.");
  }
}

export function sha256Hex(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function validateUploadBuffer(input: {
  buffer: Buffer;
  declaredMime?: string | null;
  filename: string;
  purpose: MediaPurposeValue;
}): {
  mimeType: string;
  originalFilename: string;
  checksumSha256: string;
} {
  const forbidden = detectForbiddenPayload(input.buffer);
  if (forbidden) {
    throw new MediaValidationError(forbidden);
  }

  const max = PURPOSE_MAX_BYTES[input.purpose] ?? MAX_IMAGE_BYTES;
  if (input.buffer.length > max) {
    throw new MediaValidationError(
      `File exceeds the ${Math.floor(max / (1024 * 1024))}MB limit for ${input.purpose}.`,
    );
  }
  if (input.buffer.length > MAX_IMAGE_BYTES) {
    throw new MediaValidationError("File exceeds the global 8MB image limit.");
  }

  const sniffed = sniffImageMime(input.buffer);
  if (!sniffed || !ALLOWED_IMAGE_MIME.has(sniffed)) {
    throw new MediaValidationError(
      "Only JPEG, PNG, WebP, and GIF images are allowed.",
    );
  }

  if (
    input.declaredMime &&
    input.declaredMime !== "application/octet-stream" &&
    input.declaredMime !== sniffed
  ) {
    // Allow image/jpg alias for jpeg
    const declared =
      input.declaredMime === "image/jpg" ? "image/jpeg" : input.declaredMime;
    if (declared !== sniffed) {
      throw new MediaValidationError(
        "Declared Content-Type does not match file contents.",
      );
    }
  }

  const originalFilename = sanitizeOriginalFilename(input.filename);
  const lower = originalFilename.toLowerCase();
  const dangerousExt =
    /\.(exe|dll|bat|cmd|com|msi|scr|js|mjs|cjs|php|phtml|asp|aspx|jsp|cgi|sh|bash|zsh|ps1|py|rb|pl|jar|war|apk|dmg|pkg|deb|rpm|html?|svg|xml)$/i;
  if (dangerousExt.test(lower)) {
    throw new MediaValidationError(
      "Executable or script file extensions are not allowed.",
    );
  }

  return {
    mimeType: sniffed,
    originalFilename,
    checksumSha256: sha256Hex(input.buffer),
  };
}

export function validateAltText(alt: string): string {
  const trimmed = alt.trim();
  if (trimmed.length < 3) {
    throw new MediaValidationError("Alt text must be at least 3 characters.");
  }
  if (trimmed.length > 300) {
    throw new MediaValidationError("Alt text must be at most 300 characters.");
  }
  return trimmed;
}

export function validateCaption(caption: string | null | undefined): string | null {
  if (caption == null || caption.trim() === "") return null;
  const trimmed = caption.trim();
  if (trimmed.length > 500) {
    throw new MediaValidationError("Caption must be at most 500 characters.");
  }
  return trimmed;
}
