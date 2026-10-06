"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { formatCents } from "@/lib/utils";

type Hit = {
  id: number;
  title: string;
  handle: string | null;
  baseSku: string | null;
  image: string | null;
  retailMinCents: number;
};

/**
 * Instant SKU/name typeahead. Type "903" and MA-0903 surfaces. Matching is
 * done server-side against the numeric core of the SKU (prefix/zeros ignored),
 * the full SKU, and the product title.
 */
export function CatalogSearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const query = q.trim();
    if (query.length < 1) {
      setHits([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setHits(data.hits || []);
          setOpen(true);
          setActive(-1);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q]);

  function go(hit: Hit) {
    setOpen(false);
    if (hit.handle) router.push(`/catalog/${hit.handle}`);
    else router.push(`/catalog?q=${encodeURIComponent(hit.baseSku ?? q)}`);
  }

  function submit() {
    setOpen(false);
    router.push(q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : "/catalog");
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-lg">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && hits[active]) go(hits[active]);
          else submit();
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search by SKU (try 903) or product name…"
          className="input pl-9 pr-9"
          aria-label="Search catalog"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-300" />
        )}
      </form>

      {open && hits.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-lg border border-brand-100 bg-white py-1 shadow-lg">
          {hits.map((hit, i) => (
            <li key={hit.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  i === active ? "bg-brand-50" : ""
                }`}
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                  {hit.image && (
                    <Image
                      src={hit.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-brand-900">
                    {hit.title}
                  </span>
                  <span className="text-xs text-brand-800/50">
                    <span className="font-mono text-saddle-dark">
                      {hit.baseSku}
                    </span>{" "}
                    · MSRP from {formatCents(hit.retailMinCents)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
