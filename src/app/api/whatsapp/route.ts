import { NextResponse } from "next/server";

type CheckoutPayload = {
  customerName: string;
  phone: string;
  address: string;
  paymentType: string;
  delivery: boolean;
  orderDate: string;
  orderTime: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
};

const OWNER_PHONE = process.env.WHATSAPP_OWNER_PHONE ?? "5210000000000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  let body: CheckoutPayload;
  try {
    body = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  let orderId: string | null = null;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const orderInsert = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        customer_name: body.customerName,
        phone: body.phone,
        address: body.address,
        payment_type: body.paymentType,
        delivery: body.delivery,
        order_date: body.orderDate,
        order_time: body.orderTime,
        status: "pendiente",
        total: body.total,
      }),
    });

    if (!orderInsert.ok) {
      const errorText = await orderInsert.text();
      return NextResponse.json(
        { error: `No se pudo guardar order: ${errorText}` },
        { status: 500 },
      );
    }

    const insertedOrder = (await orderInsert.json()) as Array<{ id: string }>;
    orderId = insertedOrder[0]?.id ?? null;

    if (!orderId) {
      return NextResponse.json({ error: "No se obtuvo order_id." }, { status: 500 });
    }

    const orderItems = body.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const itemsInsert = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(orderItems),
    });

    if (!itemsInsert.ok) {
      const errorText = await itemsInsert.text();
      return NextResponse.json(
        { error: `Pedido guardado pero fallo order_items: ${errorText}` },
        { status: 500 },
      );
    }
  }

  const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

  // Fecha: yyyy-mm-dd → dd/mm/yyyy
  const [y, mo, d] = body.orderDate.split("-");
  const fechaFormateada = `${d}/${mo}/${y}`;

  const lines = body.items
    .map((item) => `  • ${item.name} × ${item.quantity}  →  ${mxn.format(item.price * item.quantity)}`)
    .join("\n");

  const message = [
    "🍬 *NUEVO PEDIDO — Dulcería Artesanal*",
    "─────────────────────────────",
    `👤 *Cliente:*  ${body.customerName}`,
    `� *Teléfono:*  ${body.phone}`,
    `📅 *Fecha de entrega:*  ${fechaFormateada}`,
    `🕐 *Hora de entrega:*  ${body.orderTime}`,
    `${body.delivery ? "🛵 *Entrega:*  Domicilio" : "🏪 *Entrega:*  Recoger en tienda"}`,
    `📍 *Dirección:*  ${body.address}`,
    `💳 *Pago:*  ${body.paymentType === "efectivo" ? "Efectivo" : "Transferencia"}`,
    "─────────────────────────────",
    "🛒 *Productos:*",
    lines,
    "─────────────────────────────",
    `💰 *Total:*  ${mxn.format(body.total)}`,
    orderId ? `🔖 *Folio:*  #${orderId.slice(0, 8).toUpperCase()}` : "",
  ].filter(Boolean).join("\n");

  const waUrl = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
  return NextResponse.json({ waUrl, orderId });
}
