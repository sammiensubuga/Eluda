import { MAX_LONG_SIDE, MAX_UPLOAD_BYTES } from "./constants";

export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  if (![width, height, maxSide].every(Number.isFinite) || width <= 0 || height <= 0 || maxSide <= 0) {
    throw new RangeError("Image dimensions must be positive finite numbers.");
  }
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

export type UploadPreparationReason = "unsupported" | "too_large" | "invalid";

export class UploadPreparationError extends Error {
  constructor(readonly reason: UploadPreparationReason) {
    super(reason);
    this.name = "UploadPreparationError";
  }
}

export async function prepareUpload(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new UploadPreparationError("unsupported");
  }

  let bitmap: ImageBitmap;
  try {
    if (typeof createImageBitmap !== "function") throw new Error("bitmap_unavailable");
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (file.size > MAX_UPLOAD_BYTES) throw new UploadPreparationError("too_large");
    return file;
  }

  try {
    if (Math.max(bitmap.width, bitmap.height) <= MAX_LONG_SIDE) {
      if (file.size > MAX_UPLOAD_BYTES) throw new UploadPreparationError("too_large");
      return file;
    }

    const dimensions = fitWithin(bitmap.width, bitmap.height, MAX_LONG_SIDE);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new UploadPreparationError("invalid");
    context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new UploadPreparationError("invalid"));
      }, "image/jpeg", 0.85);
    }).catch(() => {
      throw new UploadPreparationError("invalid");
    });
    if (blob.size > MAX_UPLOAD_BYTES) throw new UploadPreparationError("too_large");
    return new File([blob], "photo.jpg", { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
