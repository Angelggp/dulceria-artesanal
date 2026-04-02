"use client";

import { useEffect, useState } from "react";
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

export default function AnnouncementTicker() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/banner")
      .then((r) => r.json())
      .then((data: { banners: Banner[] }) => {
        setBanners(data.banners ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || banners.length === 0) return null;

  // Usamos el color del primer banner activo (o el más reciente)
  const primaryColor = banners[0]?.color ?? "amber";
  const { bg, text, separator } = getColors(primaryColor);

  // Repetimos el contenido dos veces para lograr el loop continuo sin saltos
  const tickerContent = (
    <>
      {banners.map((banner, i) => (
        <span key={banner.id} className="inline-flex items-center shrink-0">
          <span>{banner.text}</span>
          {i < banners.length - 1 && (
            <span className={`mx-6 text-lg font-bold ${separator}`} aria-hidden>✦</span>
          )}
        </span>
      ))}
      {/* separador entre vuelta y vuelta */}
      <span className={`mx-8 text-lg font-bold ${separator}`} aria-hidden>✦</span>
    </>
  );

  return (
    <div
      className={`${bg} ${text} overflow-hidden py-2 text-sm font-semibold tracking-wide select-none`}
      aria-label="Anuncios promocionales"
    >
      {/* Animación marquee pura CSS — sin dependencias de librerías adicionales */}
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "ticker-scroll 28s linear infinite" }}
      >
        {/* duplicamos para loop sin salto visible */}
        <span className="inline-flex items-center shrink-0 mr-8">{tickerContent}</span>
        <span className="inline-flex items-center shrink-0 mr-8" aria-hidden>{tickerContent}</span>
      </div>
    </div>
  );
}
