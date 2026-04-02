"use client";

import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  // isLanding: la landing necesita full-width (sin max-w ni px)
  const isLanding = pathname === "/";
  if (isLanding) return <main className="pb-20 md:pb-0">{children}</main>;
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:pb-6">{children}</main>
  );
}
