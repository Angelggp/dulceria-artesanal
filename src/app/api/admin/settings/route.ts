import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** GET /api/admin/settings */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ settings: {} });
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=key,value`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ settings: {} });
  const rows = (await res.json()) as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  return NextResponse.json({ settings });
}

/** PATCH /api/admin/settings — upsert { key, value } */
export async function PATCH(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }
  let body: { key: string; value: string };
  try {
    body = (await request.json()) as { key: string; value: string };
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!body.key) {
    return NextResponse.json({ error: "key es requerido." }, { status: 400 });
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ key: body.key, value: body.value }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
