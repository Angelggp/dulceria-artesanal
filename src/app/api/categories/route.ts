import { NextResponse } from "next/server";
import { Category } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FALLBACK: Category[] = [
  { id: "chocolates", name: "Chocolates", emoji: "🍫" },
  { id: "gomitas",    name: "Gomitas",    emoji: "🍬" },
  { id: "paletas",    name: "Paletas",    emoji: "🍭" },
  { id: "enchilados", name: "Enchilados", emoji: "🌶️" },
  { id: "regalos",    name: "Regalos",    emoji: "🎁" },
];

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ categories: FALLBACK });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?select=id,name,emoji&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error();
    const categories = (await res.json()) as Category[];
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: FALLBACK });
  }
}
