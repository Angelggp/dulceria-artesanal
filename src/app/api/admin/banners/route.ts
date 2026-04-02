import { NextResponse } from "next/server";
import { Banner } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** GET /api/admin/banners — lista todos los banners (admin) */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/banners?select=id,text,active,color,created_at&order=created_at.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  const banners = (await res.json()) as Banner[];
  return NextResponse.json({ banners });
}

/** POST /api/admin/banners — crea un nuevo banner */
export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const body = await req.json() as { text?: string; color?: string };
  const { text, color = "amber" } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "El texto del banner es requerido." }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/banners`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ text: text.trim(), color, active: true }),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  const [banner] = (await res.json()) as Banner[];
  return NextResponse.json({ banner }, { status: 201 });
}
