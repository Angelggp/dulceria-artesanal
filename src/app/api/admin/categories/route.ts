import { NextResponse } from "next/server";
import { Category } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Genera un slug simple a partir del nombre (sin dependencias externas) */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")     // reemplaza no-alfanuméricos con guión
    .replace(/^-+|-+$/g, "");         // trim guiones
}

// GET — lista todas las categorías
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?select=id,name,emoji&order=name.asc`,
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

  const categories = (await res.json()) as Category[];
  return NextResponse.json({ categories });
}

// POST — crear categoría (ID auto-generado del nombre)
export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: { name: string; emoji?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 });
  }

  const id = slugify(body.name.trim());
  if (!id) {
    return NextResponse.json({ error: "El nombre no genera un ID válido." }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ id, name: body.name.trim(), emoji: body.emoji?.trim() ?? "" }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }

  const [category] = (await res.json()) as Category[];
  return NextResponse.json({ category }, { status: 201 });
}
