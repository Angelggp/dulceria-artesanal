# 🍬 Dulcería Artesanal

Tienda online de dulces artesanales construida con **Next.js 16 App Router**, **Supabase**, **Tailwind CSS** y **Framer Motion**. Diseñada mobile-first con un flujo completo de catálogo → carrito → checkout → confirmación por WhatsApp, más un panel de administración protegido.

## ✨ Características

### Tienda (cliente)
- **Landing page** animada con badge de estado abierto/cerrado en tiempo real, galería de categorías y horario
- **Catálogo** (`/catalogo`) con filtros por categoría, buscador en tiempo real, skeletons de carga y modal de detalle por producto
- **Carrito persistente** en `localStorage` con Zustand — counter animado en header y bottom navbar
- **Checkout** (`/checkout`) con formulario de datos, tipo de entrega y método de pago
- **Confirmación** (`/confirmacion`) que envía el pedido completo por WhatsApp al negocio
- **Favoritos** guardados en `localStorage`

### Panel Admin (`/admin`)
- Autenticación con Supabase Auth (email/contraseña), JWT en cookie `httpOnly`
- Middleware de protección de rutas con Next.js
- **Pedidos** — listado con filtros por estado, stepper visual, cambio de estado en tiempo real
- **Productos** — CRUD completo con subida de imágenes a Cloudinary (drag & drop), formulario unificado crear/editar, modal de confirmación para eliminar
- **Categorías** — CRUD con emoji, slug auto-generado y modal de confirmación para eliminar

## 🛠 Stack técnico

| Tecnología | Uso |
|---|---|
| Next.js 15 (App Router) | Framework principal |
| React 19 + TypeScript | UI + tipado |
| Tailwind CSS v4 | Estilos |
| Framer Motion | Animaciones |
| Zustand 5 | Estado del carrito |
| Supabase (REST API) | Base de datos y autenticación |
| Cloudinary | Subida y almacenamiento de imágenes |
| lucide-react | Iconografía |

## 🚀 Instalación y ejecución

```bash
npm install
npm run dev
```

## ⚙️ Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
ADMIN_EMAIL=admin@ejemplo.com
ADMIN_PASSWORD=contraseña_segura
```

## 🗄️ Base de datos (Supabase)

Ejecuta el archivo `supabase/schema.sql` en el **SQL Editor** de tu proyecto Supabase. Esto crea las tablas:

- `categories` — categorías de productos (emoji, nombre, slug-id)
- `products` — productos con nombre, precio, stock, imagen, descripción y FK a categoría
- `orders` — pedidos con cliente, dirección, tipo de entrega y pago
- `order_items` — líneas de cada pedido con cantidad y precio

## 📱 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── catalogo/page.tsx     # Catálogo con filtros y modal
│   ├── carrito/page.tsx      # Carrito de compras
│   ├── checkout/page.tsx     # Formulario de pedido
│   ├── confirmacion/page.tsx # Confirmación y envío a WhatsApp
│   └── admin/                # Panel de administración
│       ├── login/page.tsx
│       ├── pedidos/page.tsx
│       ├── productos/page.tsx
│       └── categorias/page.tsx
├── components/
│   ├── header.tsx
│   ├── bottom-nav.tsx        # Navbar fija en mobile
│   ├── footer.tsx
│   └── toast-provider.tsx   # Toast al agregar al carrito
├── store/
│   └── cart-store.ts         # Zustand con persistencia
└── lib/
    ├── types.ts
    ├── format.ts
    └── mock-products.ts      # Datos de respaldo sin Supabase
```

## 🔄 Flujo de compra

1. Usuario explora el catálogo en `/catalogo`, filtra por categoría o busca por nombre
2. Agrega productos al carrito (con límite de stock)
3. En `/carrito` revisa y ajusta cantidades
4. En `/checkout` llena sus datos y elige entrega y método de pago
5. El pedido se guarda en Supabase y redirige a `/confirmacion`
6. Se abre WhatsApp con el resumen completo del pedido listo para enviar al negocio

## 🔐 Autenticación admin

La ruta `/admin/*` está protegida por middleware que verifica el JWT de Supabase Auth almacenado en una cookie `httpOnly`. El login usa `POST /auth/v1/token?grant_type=password` de Supabase.

# dulceria-artesanal

