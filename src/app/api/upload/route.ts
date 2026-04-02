import { NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(request: Request) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado. Revisa las variables de entorno." },
      { status: 500 },
    );
  }

  let body: { file: string; folder?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!body.file) {
    return NextResponse.json({ error: "El campo 'file' es requerido (base64 o URL)." }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = body.folder ?? "dulceria";

  // Firma SHA-1 requerida por Cloudinary: SHA1(params_ordenados + api_secret)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + API_SECRET)
    .digest("hex");

  // FormData en lugar de URLSearchParams para soportar base64 de imágenes grandes
  const form = new FormData();
  form.append("file", body.file);
  form.append("api_key", API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

  if (!cloudRes.ok) {
    const detail = await cloudRes.text();
    return NextResponse.json(
      { error: `Upload falló: ${detail}` },
      { status: 500 },
    );
  }

  const data = (await cloudRes.json()) as { secure_url: string; public_id: string };
  return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
}
