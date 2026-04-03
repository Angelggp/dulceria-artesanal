# API Reference — Dulcería

Base URL en desarrollo: `http://localhost:3000`  
Todas las rutas son Next.js Route Handlers bajo `src/app/api/`.

---

## Autenticación

Las rutas de administración (`/api/admin/*`) requieren una cookie `sb_admin_token` con un JWT válido generado por Supabase. El middleware la valida en cada petición.

Las rutas públicas usan la **anon key** de Supabase (solo lectura).  
Las rutas admin usan la **service role key** (lectura y escritura).

---

## Rutas públicas

### Productos

#### `GET /api/products`
Devuelve todos los productos visibles (`visible = true`) ordenados por nombre.

**Respuesta `200`**
```json
{
  "products": [
    {
      "id": "choc-01",
      "name": "Caja de Trufas Artesanales",
      "category": "chocolates",
      "price": 220,
      "image": "https://...",
      "description": "...",
      "stock": 12,
      "visible": true
    }
  ],
  "source": "supabase"
}
```
> Si Supabase no está configurado, devuelve los datos mock con `"source": "mock"`.

---

#### `GET /api/products/[id]`
No implementado (usar admin PATCH/DELETE).

---

### Categorías

#### `GET /api/categories`
Devuelve todas las categorías ordenadas por nombre.

**Respuesta `200`**
```json
{
  "categories": [
    { "id": "chocolates", "name": "Chocolates", "emoji": "🍫" }
  ]
}
```

---

### Banners / Ticker

#### `GET /api/banner`
Devuelve solo los banners activos (`active = true`).

**Respuesta `200`**
```json
{
  "banners": [
    { "id": "uuid", "text": "¡Envío gratis!", "active": true, "color": "amber" }
  ]
}
```

---

### Configuración

#### `GET /api/settings`
Devuelve todas las claves de configuración pública como objeto.

**Respuesta `200`**
```json
{
  "settings": {
    "efectivo_only": "true"
  }
}
```

| Clave | Valores | Descripción |
|-------|---------|-------------|
| `efectivo_only` | `"true"` / `"false"` | Si `"true"`, el checkout solo permite pago en efectivo |

---

### Pedidos

#### `GET /api/orders`
> ⚠️ Usa service role key. Devuelve todos los pedidos con sus items y productos asociados.

**Respuesta `200`**
```json
{
  "orders": [
    {
      "id": "uuid",
      "customer_name": "María García",
      "phone": "5512345678",
      "address": "Calle 1 #2",
      "payment_type": "efectivo",
      "delivery": false,
      "order_date": "2026-04-05",
      "order_time": "10:00",
      "status": "pendiente",
      "total": 305.00,
      "created_at": "2026-04-03T20:00:00Z",
      "archived": false,
      "order_items": [
        {
          "id": 1,
          "product_id": "choc-01",
          "quantity": 2,
          "price": 220,
          "products": { "id": "choc-01", "name": "Caja de Trufas" }
        }
      ]
    }
  ]
}
```

#### `PATCH /api/orders/[id]`
Actualiza campos de un pedido (estado, archivado, etc.).

**Body**
```json
{ "status": "en preparación" }
{ "archived": true }
```

**Respuesta `200`** `{ "ok": true }`

---

### WhatsApp

#### `POST /api/whatsapp`
Inserta el pedido en la base de datos y genera la URL de WhatsApp con el resumen.

**Body**
```json
{
  "customerName": "María García",
  "phone": "5512345678",
  "address": "Recoge en tienda",
  "paymentType": "efectivo",
  "delivery": false,
  "orderDate": "2026-04-05",
  "orderTime": "10:00",
  "items": [
    { "productId": "choc-01", "name": "Caja de Trufas", "quantity": 1, "price": 220 }
  ],
  "total": 220
}
```

**Respuesta `200`**
```json
{
  "waUrl": "https://wa.me/52XXXXXXXXXX?text=..."
}
```

---

## Rutas de administración

> Todas requieren cookie `sb_admin_token` válida (validada en `src/middleware.ts`).

### Auth

#### `POST /api/admin/login`
**Body** `{ "password": "..." }`  
**Respuesta `200`** `{ "ok": true }` — establece cookie `sb_admin_token` (httpOnly, 8 h).

#### `POST /api/admin/logout`
Elimina la cookie y redirige a `/admin/login`.  
**Respuesta `200`** `{ "ok": true }`

---

### Productos (admin)

#### `GET /api/admin/products`
Devuelve **todos** los productos incluyendo los ocultos (`visible = false`).

#### `POST /api/products`
Crea un nuevo producto.

**Body**
```json
{
  "name": "Gomitas surtidas",
  "category": "gomitas",
  "price": 50,
  "image": "https://...",
  "description": "...",
  "stock": 30
}
```
**Respuesta `201`** `{ "product": { ...producto creado } }`

#### `PATCH /api/products/[id]`
Actualiza campos de un producto (incluyendo `visible`).

**Body** (parcial)
```json
{ "stock": 0 }
{ "visible": false }
{ "price": 99.99 }
```
**Respuesta `200`** `{ "ok": true }`

#### `DELETE /api/products/[id]`
Elimina un producto. Falla con `409` si tiene pedidos asociados en `order_items`.

**Respuesta `409`**
```json
{
  "error": "Este producto tiene pedidos asociados y no puede eliminarse...",
  "blocked": true
}
```

---

### Categorías (admin)

#### `GET /api/admin/categories`
Devuelve todas las categorías.

#### `POST /api/admin/categories`
**Body** `{ "name": "Paletas", "emoji": "🍭" }`  
**Respuesta `201`** `{ "category": { "id": "paletas", "name": "Paletas", "emoji": "🍭" } }`

#### `PATCH /api/admin/categories/[id]`
**Body** `{ "name": "Nuevo nombre", "emoji": "🆕" }`  
**Respuesta `200`** `{ "ok": true }`

#### `DELETE /api/admin/categories/[id]`
Falla con `409` si la categoría tiene productos asociados.

---

### Banners / Anuncios (admin)

#### `GET /api/admin/banners`
Devuelve **todos** los banners (activos e inactivos).

#### `POST /api/admin/banners`
**Body** `{ "text": "¡Oferta especial!", "color": "rose", "active": true }`  
**Respuesta `201`** `{ "banner": { ...banner creado } }`

#### `PATCH /api/admin/banners/[id]`
**Body** (parcial) `{ "active": false }` / `{ "text": "Nuevo texto", "color": "sky" }`  
**Respuesta `200`** `{ "ok": true }`

#### `DELETE /api/admin/banners/[id]`
**Respuesta `200`** `{ "ok": true }`

---

### Configuración (admin)

#### `GET /api/admin/settings`
Igual que `/api/settings` pero con service role key.

#### `PATCH /api/admin/settings`
Upsert de una clave de configuración.

**Body**
```json
{ "key": "efectivo_only", "value": "true" }
```
**Respuesta `200`** `{ "ok": true }`

---

### Upload de imágenes

#### `POST /api/upload`
Sube una imagen a Cloudinary y devuelve la URL pública.

**Body** `{ "file": "data:image/png;base64,..." }`  
**Respuesta `200`** `{ "url": "https://res.cloudinary.com/..." }`

---

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (solo lectura) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (lectura/escritura) |
| `ADMIN_PASSWORD` | Contraseña del panel admin |
| `JWT_SECRET` | Secreto para firmar el token de sesión admin |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |
| `WHATSAPP_PHONE` | Número de WhatsApp destino (formato: `521XXXXXXXXXX`) |
