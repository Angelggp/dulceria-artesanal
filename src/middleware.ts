import { NextRequest, NextResponse } from "next/server";

/**
 * Decodifica el payload del JWT y verifica que no haya expirado.
 * No verifica la firma — eso lo hace Supabase. Este check rápido
 * basta para el edge: tokens inválidos/expirados son rechazados,
 * y cualquier petición real a Supabase fallará si el token fue manipulado.
 */
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return (
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get("sb_admin_token")?.value ?? "";
  const isAuthenticated = token !== "" && isTokenValid(token);

  if (!isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/pedidos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
