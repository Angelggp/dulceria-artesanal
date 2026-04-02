import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** PATCH /api/admin/banners/[id] — edita texto, color o activo */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const { id } = await params;
  const body = await req.json() as { text?: string; active?: boolean; color?: string };

  // Solo se actualizan los campos que vienen en el body
  const update: Record<string, unknown> = {};
  if (body.text !== undefined) update.text = body.text.trim();
  if (body.active !== undefined) update.active = body.active;
  if (body.color !== undefined) update.color = body.color;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Sin cambios." }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/banners?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(update),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  const [banner] = await res.json();
  return NextResponse.json({ banner });
}

/** DELETE /api/admin/banners/[id] — elimina un banner */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const { id } = await params;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/banners?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
