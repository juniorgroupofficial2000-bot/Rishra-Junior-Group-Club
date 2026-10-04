import { randomBytes } from "node:crypto";

/** Cuid-like opaque id for media assets (compatible with Prisma String ids). */
export function createId(): string {
  return `c${randomBytes(12).toString("hex")}`;
}
