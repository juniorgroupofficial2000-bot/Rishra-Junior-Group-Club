import type { HeritageMedia } from "@/content/heritage";
import { cn } from "@/lib/cn";
import Image from "next/image";

type HeritageImageProps = {
  image: HeritageMedia;
  className?: string;
  frameClassName?: string;
  imgClassName?: string;
  sizes: string;
  priority?: boolean;
};

export function HeritageImage({
  image,
  className,
  frameClassName,
  imgClassName,
  sizes,
  priority = false,
}: HeritageImageProps) {
  const isSvg = image.src.endsWith(".svg");

  return (
    <figure className={cn("min-w-0", className)}>
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden bg-ink-900 sm:rounded-xl",
          frameClassName,
        )}
      >
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
      {image.caption ? (
        <figcaption className="mt-2 text-xs text-ink-500">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}
