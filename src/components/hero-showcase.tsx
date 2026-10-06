"use client";

import { useEffect, useState } from "react";

// A "living" hero: crossfades through real catalog photography with a slow
// Ken Burns zoom, so the header feels like a short looping clip.
type Slide = { img: string; label: string };

export function HeroShowcase({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(
      () => setActive((v) => (v + 1) % slides.length),
      3000
    );
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.img}
            src={s.img}
            alt={s.label}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-[1200ms] ease-in-out ${
              i === active ? "animate-kenburns opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/75 via-brand-900/20 to-transparent p-4">
          <span className="inline-block rounded-md bg-brand-900/40 px-2 py-1 text-xs font-medium text-cream backdrop-blur-sm sm:text-sm">
            {slides[active]?.label}
          </span>
        </div>
      </div>

      {/* progress dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.img}
            onClick={() => setActive(i)}
            aria-label={`Show ${s.label}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-saddle" : "w-1.5 bg-brand-200 hover:bg-brand-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
