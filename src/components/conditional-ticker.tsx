"use client";

import { usePathname } from "next/navigation";
import AnnouncementTicker from "@/components/announcement-ticker";

const PUBLIC_PATHS = ["/", "/catalogo", "/carrito", "/checkout", "/confirmacion"];

export default function ConditionalTicker() {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!isPublic) return null;
  return <AnnouncementTicker />;
}
