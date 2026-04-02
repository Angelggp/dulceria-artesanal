"use client";

import { useEffect, useRef, useState } from "react";
import { Banner } from "@/lib/types";

const COLOR_CLASSES: Record<string, { bg: string; text: string; separator: string }> = {
  amber:  { bg: "bg-amber-400",  text: "text-amber-950", separator: "text-amber-700" },
  rose:   { bg: "bg-rose-500",   text: "text-white",     separator: "text-rose-200"  },
  violet: { bg: "bg-violet-600", text: "text-white",     separator: "text-violet-200"},
  emerald:{ bg: "bg-emerald-500",text: "text-white",     separator: "text-emerald-200"},
  sky:    { bg: "bg-sky-500",    text: "text-white",     separator: "text-sky-200"   },
  zinc:   { bg: "bg-zinc-800",   text: "text-white",     separator: "text-zinc-400"  },
};

function getColors(color: string) {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES.amber;
}

// Repeticiones por copia — garantiza que UNA copia siempre sea más ancha
// que cualquier pantalla (móvil/tablet/desktop) aunque el texto sea corto.
const REPS = 6;

export default function AnnouncementTicker() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const firstCopyRef = useRef<HTMLSpanElement>(null);
  const [tickerOffset, setTickerOffset] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/banner")
      .then((r) => r.json())
      .then((data: { banners: Banner[] }) => {
        setBanners(data.banners ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Medir el ancho REAL de la primera copia tras render + fuentes
  useEffect(() => {
    if (!loaded || banners.length === 0) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (firstCopyRef.current) {
          setTickerOffset(`-${firstCopyRef.current.offsetWidth}px`);
        }
      }),
    );
  }, [banners, loaded]);

  if (!loaded || banners.length === 0) return null;

  const primaryColor = banners[0]?.color ?? "amber";
  const { bg, text, separator } = getColors(primaryColor);

  // Una copia = REPS repeticiones del contenido.
  // Con REPS=6, aunque el texto mida 50px, una copia = 300px+ → siempre supera la pantalla.
  const renderCopy = (prefix: string, hidden?: true) =>
    Array.from({ length: REPS }, (_, rep) =>
      banners.map((banner) => (
        <span
          key={`${prefix}-${rep}-${banner.id}`}
          className="inline-flex items-center shrink-0"
          aria-hidden={hidden}
        >
          <span className="px-3">{banner.text}</span>
          <span className={`mx-5 font-bold ${separator}`} aria-hidden>✦</span>
        </span>
      )),
    ).flat();

  return (
    <div
      className={`${bg} ${text} overflow-hidden py-2 text-sm font-semibold tracking-wide select-none`}
      aria-label="Anuncios promocionales"
    >
      {/*
        Layout: [copia A (REPS items)][copia B (REPS items)]
        Animación: translateX(0) → translateX(-anchoA)
        Al resetear, copia B quedó exactamente donde estaba copia A → sin salto.
        Como anchoA > ancho de pantalla, el reset ocurre fuera del área visible.
      */}
      <div
        className="flex items-center whitespace-nowrap"
        style={
          tickerOffset
            ? ({
                animation: "ticker-scroll 200s linear infinite",
                "--ticker-offset": tickerOffset,
                willChange: "transform",
              } as React.CSSProperties)
            : { visibility: "hidden" }
        }
      >
        <span ref={firstCopyRef} className="inline-flex items-center shrink-0">
          {renderCopy("a")}
        </span>
        <span className="inline-flex items-center shrink-0" aria-hidden>
          {renderCopy("b", true)}
        </span>
      </div>
    </div>
  );
}
