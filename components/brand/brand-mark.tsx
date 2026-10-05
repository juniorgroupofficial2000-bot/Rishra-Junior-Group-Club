import { siteMedia } from "@/content/site-media";
import { cn } from "@/lib/cn";
import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  /** Pixel size for the square mark (CSS width/height). */
  size?: number;
  priority?: boolean;
  /**
   * When true (default), mark is decorative beside visible brand text.
   * Set false when the mark is the only brand signal.
   */
  decorative?: boolean;
};

/**
 * Club logo mark — transparent PNG derived from `public/images/home/logo.png`.
 */
export function BrandMark({
  className,
  size = 40,
  priority = false,
  decorative = true,
}: BrandMarkProps) {
  const logo = siteMedia.logo;
  return (
    <Image
      src={logo.src}
      alt={decorative ? "" : logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      sizes={`${size}px`}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ width: size, height: size }}
      aria-hidden={decorative || undefined}
    />
  );
}
