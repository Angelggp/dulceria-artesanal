import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function POST(request: Request) {
  let body: { email: string; password: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Correo y contraseña son requeridos." },
      { status: 400 },
    );
  }

  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  if (!authRes.ok) {
    return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
  }

  const data = (await authRes.json()) as { access_token: string; expires_in: number };

  const response = NextResponse.json({ ok: true });
  response.cookies.set("sb_admin_token", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in ?? 3600,
  });
  return response;
}
