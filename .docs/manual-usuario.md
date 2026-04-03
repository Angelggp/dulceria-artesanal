# Manual de usuario — Dulcería

## Tienda (cliente)

### Navegar el catálogo
- Accede desde la página de inicio o el botón **Ver catálogo**.
- Filtra por categoría usando los botones de la parte superior.
- Usa la barra de búsqueda para encontrar un producto por nombre.
- Los productos agotados o desactivados por el administrador **no aparecen**.

### Agregar al carrito
- Haz clic en **Agregar** en la tarjeta del producto.
- El contador del carrito (ícono en la barra inferior) se actualiza al instante.
- Desde el carrito puedes cambiar la cantidad o eliminar productos.

### Hacer un pedido
1. Abre el carrito y pulsa **Confirmar pedido**.
2. Rellena el formulario:
   - **Nombre completo**
   - **Teléfono** (solo números)
   - **Fecha del pedido** — mínimo con 24 h de anticipación; los sábados estamos cerrados
   - **Hora de entrega** — entre 8:00 AM y 7:00 PM
   - **Método de pago** — según lo configurado por el administrador
   - **Envío a domicilio** — actívalo si necesitas entrega; escribe tu dirección
3. Pulsa **Confirmar pedido** → se abrirá WhatsApp con el resumen listo para enviar.
4. El carrito se vacía automáticamente al llegar a la pantalla de confirmación.

> **Nota:** si sales del formulario y vuelves, tus datos quedan guardados temporalmente (se borran al cerrar el navegador o al completar el pedido).

---

## Panel de administración

Accede en `/admin/login`. Las credenciales se configuran en Supabase Auth.

### Dashboard
- Muestra totales: pedidos activos, ingresos del día, productos en stock bajo y clientes.
- **Configuración rápida:** toggle para activar/desactivar el modo *Solo efectivo* en el checkout.

### Pedidos (`/admin/pedidos`)
- Lista todos los pedidos en tres pestañas: **Activos**, **Archivados** y **Todos**.
- **Barra de búsqueda:** filtra por nombre del cliente, folio (ID) o nombre de producto.
- **Filtro por fecha:** muestra solo pedidos de un día específico.
- **Cambiar estado:** usa el selector en cada tarjeta (`pendiente → en preparación → listo → entregado → cancelado`).
- **Archivar / Desarchivar:** botón en la esquina de cada tarjeta.
- **Notificaciones:** ícono de campana — activa/desactiva alertas de nuevos pedidos en el navegador.
- Cada tarjeta muestra: folio, cliente, teléfono, hora de entrega, tipo de entrega, productos, total y estado.

### Productos (`/admin/productos`)
- Lista todos los productos incluyendo los ocultos (badge gris **Oculto**).
- **Nuevo producto:** nombre, categoría, precio, stock, imagen (drag & drop o URL), descripción.
- **Editar:** modifica cualquier campo del producto.
- **Visible / Oculto:** toggle por producto — los ocultos desaparecen del catálogo público sin eliminarlos.
- **Eliminar:** solo es posible si el producto no tiene pedidos asociados; de lo contrario ocúltalo.

### Categorías (`/admin/categorias`)
- Crea, edita y elimina categorías (nombre + emoji).
- El ID/slug se genera automáticamente desde el nombre.
- No se puede eliminar una categoría que tenga productos asociados.

### Anuncios (`/admin/anuncios`)
- Administra los mensajes del ticker promocional que aparece en la tienda.
- Crea anuncios con texto y color (ámbar, rosa, violeta, verde, azul, oscuro).
- Activa/desactiva cada anuncio con el toggle de ojo.
- Edita o elimina anuncios existentes.

---

## Sugerencias pendientes

- **React Query:** evaluar adopción para cachear consultas de catálogo y pedidos, evitar recargas innecesarias y centralizar el estado del servidor. Complejidad media (~8-10 archivos). Alternativa: migrar páginas estáticas a Server Components de Next.js 15.
