"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Marketplace-style image gallery: a large main image with prev/next arrows,
 * a counter, and a thumbnail strip. Click a thumbnail or use the arrow keys to
 * move through every product photo.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const pics = images.length ? images : [];
  const [i, setI] = useState(0);

  const go = useCallback(
    (next: number) => {
      if (pics.length === 0) return;
      setI((next + pics.length) % pics.length);
    },
    [pics.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === "ArrowRight") go(i + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  if (pics.length === 0) {
    return (
      <div className="card flex aspect-square items-center justify-center bg-white text-brand-200">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="card group relative aspect-square overflow-hidden bg-white">
        <Image
          src={pics[i]}
          alt={`${alt} — image ${i + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
          priority
        />
        {pics.length > 1 && (
          <>
            <button
              onClick={() => go(i - 1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-brand-100 bg-white/90 text-brand-800 shadow-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(i + 1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-brand-100 bg-white/90 text-brand-800 shadow-sm transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-brand-900/80 px-2 py-0.5 text-xs font-medium text-cream">
              {i + 1} / {pics.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {pics.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pics.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition ${
                idx === i
                  ? "border-brand-600 ring-2 ring-brand-500/30"
                  : "border-brand-100 hover:border-brand-300"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
