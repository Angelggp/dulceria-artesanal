import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/mock-products";
import { Product } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ products: PRODUCTS, source: "mock" });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,category,price,image,description,stock,visible&visible=eq.true&order=name.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Supabase products error: ${response.status}`);
    }

    const products = (await response.json()) as Product[];
    return NextResponse.json({ products, source: "supabase" });
  } catch {
    return NextResponse.json({ products: PRODUCTS, source: "mock" });
  }
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: Omit<Product, "id"> & { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!body.name || !body.category || body.price === undefined || !body.image) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  const id = body.id?.trim() || `${body.category.slice(0, 4)}-${Date.now()}`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ ...body, id }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: detail }, { status: 500 });
  }

  const [product] = (await res.json()) as Product[];
  return NextResponse.json({ product }, { status: 201 });
}
