"use client";

import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const SLIDE_MS = 3000;

export function HeroCarousel({
  images,
}: {
  images: ReadonlyArray<{ src: string; alt: string }>;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  function go(next: number) {
    setIndex((next + count) % count);
  }

  return (
    <section
      className="relative min-h-[280px] overflow-hidden bg-[#F8F9FA] md:min-h-[520px]"
      aria-roledescription="carousel"
      aria-label="Club photographs"
    >
      {images.map((image, imageIndex) => (
        <img
          key={image.src}
          src={image.src}
          alt={imageIndex === index ? image.alt : ""}
          aria-hidden={imageIndex !== index}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            imageIndex === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {count > 1 ? (
        <>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((image, imageIndex) => (
              <button
                key={image.src}
                type="button"
                aria-label={`Show photograph ${imageIndex + 1}`}
                aria-current={imageIndex === index ? "true" : undefined}
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  imageIndex === index ? "bg-logo-orange" : "bg-white",
                )}
                onClick={() => go(imageIndex)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
