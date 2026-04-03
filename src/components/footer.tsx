import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-amber-200 bg-amber-50 pb-20 md:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Marca */}
          <div className="space-y-2">
            <p className="text-xl font-bold text-amber-900">🍬 Dulcería Artesanal</p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Dulces artesanales hechos con amor. Pedidos por WhatsApp para recoger o envío a domicilio.
            </p>
          </div>

          {/* Navegación */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Navegación
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/" className="text-zinc-700 hover:text-amber-800">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-zinc-700 hover:text-amber-800">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-zinc-700 hover:text-amber-800">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-zinc-700 hover:text-amber-800">
                  Administrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Horario y contacto */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Horario y contacto
            </p>
            <ul className="space-y-1 text-sm text-zinc-700">
              <li>Lunes – Sábado</li>
              <li>9:00 am – 8:00 pm</li>
              <li className="pt-1">
                <a
                  href="https://wa.me/521XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 hover:underline"
                >
                  📱 WhatsApp directo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-amber-200 pt-4 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Dulcería Artesanal. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
