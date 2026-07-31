import { readFileSync } from "node:fs";
import path from "node:path";

export type Size = { width: number; height: number };

const PNG_SIGNATURE = 0x89504e47;

/** Reads width/height out of a JPEG's SOFn segment. */
const jpegSize = (buf: Buffer): Size | null => {
  let offset = 2; // skip SOI
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    // SOF0–SOF3, SOF5–SOF7, SOF9–SOF11, SOF13–SOF15 carry the dimensions
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSof) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
};

/**
 * Intrinsic size of an image in `public/`, read straight from the file header
 * at build time. Returns null if the file is missing or an unknown format —
 * callers should fall back rather than assume an orientation.
 */
export const imageSize = (publicPath: string): Size | null => {
  try {
    const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    const buf = readFileSync(file);

    if (buf.length > 24 && buf.readUInt32BE(0) === PNG_SIGNATURE) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      return jpegSize(buf);
    }

    return null;
  } catch {
    return null;
  }
};

/** Width ÷ height, or null when the size can't be determined. */
export const aspectRatio = (publicPath: string): number | null => {
  const size = imageSize(publicPath);
  return size && size.height > 0 ? size.width / size.height : null;
};
