import { NextResponse } from "next/server";
import { Banner } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** GET /api/banner — devuelve todos los banners activos (público) */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ banners: [] });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/banners?select=id,text,color&active=eq.true&order=created_at.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error();
    const banners = (await res.json()) as Banner[];
    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ banners: [] });
  }
}
