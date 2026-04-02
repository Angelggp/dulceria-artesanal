import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// PATCH — editar nombre y/o emoji de una categoría
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: { name?: string; emoji?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.emoji !== undefined) patch.emoji = body.emoji.trim();

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE — eliminar categoría por id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  // Verificar si hay productos asignados a esta categoría
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?category=eq.${encodeURIComponent(id)}&select=id&limit=1`,
    { headers, cache: "no-store" },
  );

  if (checkRes.ok) {
    const rows = (await checkRes.json()) as unknown[];
    if (rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Esta categoría tiene productos asignados. Reasígnalos o elimínalos antes de borrar la categoría.",
          blocked: true,
        },
        { status: 409 },
      );
    }
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
}
