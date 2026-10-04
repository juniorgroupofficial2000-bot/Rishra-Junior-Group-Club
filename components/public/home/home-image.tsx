import type { HomeImage as HomeImageConfig } from "@/content/home";
import { cn } from "@/lib/cn";
import Image from "next/image";

type HomeImageProps = {
  image: HomeImageConfig;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes: string;
};

/** next/image wrapper for homepage media slots (SVG placeholders → real photos later). */
export function HomeImage({
  image,
  className,
  imgClassName,
  priority = false,
  sizes,
}: HomeImageProps) {
  const isSvg = image.src.endsWith(".svg");

  return (
    <div className={cn("relative overflow-hidden bg-ink-900", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={isSvg}
        className={cn("object-cover", imgClassName)}
      />
    </div>
  );
}
