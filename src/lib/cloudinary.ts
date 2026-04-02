const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

type TransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "thumb" | "scale";
  quality?: "auto" | number;
};

/**
 * Construye una URL de Cloudinary con transformaciones opcionales.
 * Si no hay cloud name configurado devuelve la URL original sin cambios.
 *
 * Ejemplo:
 *   cloudinaryUrl("dulceria/choc-01", { width: 500, height: 280, crop: "fill" })
 *   → https://res.cloudinary.com/TU_CLOUD/image/upload/w_500,h_280,c_fill,q_auto,f_auto/dulceria/choc-01
 */
export function cloudinaryUrl(publicId: string, opts: TransformOptions = {}): string {
  if (!CLOUD_NAME) return publicId;

  const transforms: string[] = [];
  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.crop) transforms.push(`c_${opts.crop}`);
  transforms.push(`q_${opts.quality ?? "auto"}`);
  transforms.push("f_auto");

  const t = transforms.join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}/${publicId}`;
}
