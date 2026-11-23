import sharp from "sharp";

import { JPEG_QUALITY, MAX_INPUT_PIXELS, MAX_LONG_SIDE, MAX_UPLOAD_BYTES } from "./constants";

export type ProcessPhotoResult =
  | { ok: true; jpeg: Buffer; width: number; height: number }
  | { ok: false; reason: "too_large" | "unsupported" | "invalid" };

function hasSupportedMagicBytes(input: Buffer): boolean {
  if (input.length >= 3 && input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff) return true;
  if (input.length >= 8 && input.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true;
  return input.length >= 12 && input.toString("ascii", 0, 4) === "RIFF" && input.toString("ascii", 8, 12) === "WEBP";
}

export async function processPhoto(
  input: Buffer,
  maxInputPixels = MAX_INPUT_PIXELS,
): Promise<ProcessPhotoResult> {
  if (input.byteLength > MAX_UPLOAD_BYTES) return { ok: false, reason: "too_large" };
  if (!hasSupportedMagicBytes(input)) return { ok: false, reason: "unsupported" };

  try {
    const image = sharp(input, { limitInputPixels: maxInputPixels, failOn: "error" });
    const metadata = await image.metadata();
    if (metadata.format !== "jpeg" && metadata.format !== "png" && metadata.format !== "webp") {
      return { ok: false, reason: "unsupported" };
    }
    if ((metadata.pages ?? 1) > 1) return { ok: false, reason: "unsupported" };
    if (!metadata.width || !metadata.height) return { ok: false, reason: "invalid" };

    const { data: jpeg, info } = await image
      .rotate()
      .flatten({ background: "#ffffff" })
      .resize({
        width: MAX_LONG_SIDE,
        height: MAX_LONG_SIDE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    return { ok: true, jpeg, width: info.width, height: info.height };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
