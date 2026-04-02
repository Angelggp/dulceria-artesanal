import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(*,products(id,name))&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: detail }, { status: 500 });
  }

  const orders = await res.json();
  return NextResponse.json({ orders });
}
