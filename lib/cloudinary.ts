import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Firma una subida para que el navegador suba la imagen DIRECTO a Cloudinary
// (sin pasar por nuestro servidor) sin exponer el api_secret. El patrón es:
// 1) el cliente pide una firma aquí, 2) sube el archivo a Cloudinary con esa
// firma, 3) guarda la URL que Cloudinary regresa en el producto/diseño.
export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}
