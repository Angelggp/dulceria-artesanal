import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const VALID_STATUSES = ["pendiente", "en preparación", "listo", "entregado", "cancelado"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: { status?: string; archived?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    patch.status = body.status;
  }

  if (body.archived !== undefined) {
    if (typeof body.archived !== "boolean") {
      return NextResponse.json({ error: "Campo archived inválido." }, { status: 400 });
    }
    patch.archived = body.archived;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: detail }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
