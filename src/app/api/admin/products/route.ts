import { NextResponse } from "next/server";
import { Product } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Admin: devuelve TODOS los productos (incluidos los ocultos) */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ products: [] });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,category,price,image,description,stock,visible&order=name.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return NextResponse.json({ products: [] });
  const products = (await res.json()) as Product[];
  return NextResponse.json({ products });
}
