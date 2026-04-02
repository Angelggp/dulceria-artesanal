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

  const primaryColor = banners[0]?.color ?? "amber";
  const { bg, text, separator } = getColors(primaryColor);

  // Cada item lleva separador al final — incluido el último — para que al
  // repetir, el final de la copia A fluya sin interrupción al inicio de la copia B.
  const items = banners.map((banner) => (
    <span key={banner.id} className="inline-flex items-center shrink-0">
      <span className="px-2">{banner.text}</span>
      <span className={`mx-6 text-base font-bold ${separator}`} aria-hidden>✦</span>
    </span>
  ));

  // Copia B con keys distintos — mismo contenido, necesario para el loop sin salto.
  const itemsCopy = banners.map((banner) => (
    <span key={`copy-${banner.id}`} className="inline-flex items-center shrink-0" aria-hidden>
      <span className="px-2">{banner.text}</span>
      <span className={`mx-6 text-base font-bold ${separator}`} aria-hidden>✦</span>
    </span>
  ));

  return (
    <div
      className={`${bg} ${text} overflow-hidden py-2 text-sm font-semibold tracking-wide select-none`}
      aria-label="Anuncios promocionales"
    >
      {/*
        Dos copias aplanadas en el mismo flex container.
        translateX(-50%) = exactamente el ancho de 1 copia → loop perfecto sin salto.
      */}
      <div
        className="flex items-center whitespace-nowrap"
        style={{ animation: "ticker-scroll 8s linear infinite", willChange: "transform" }}
      >
        {items}
        {itemsCopy}
      </div>
    </div>
  );
}
