/**
 * Allowed upload types and their "magic numbers" (file signatures).
 *
 * A magic number is the first few bytes of a file that identify its real
 * format, no matter what the file is named or what Content-Type the client
 * claims. Checking it stops someone renaming `virus.exe` to `photo.png`.
 */
export const imageTypes = {
  "image/jpeg": {
    extension: "jpg",
    // JPEG files start with FF D8 FF
    signatures: [[0xff, 0xd8, 0xff]],
  },
  "image/png": {
    extension: "png",
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
  "image/webp": {
    extension: "webp",
    // WEBP: "RIFF" (bytes 0-3), "WEBP" at bytes 8-11 — checked separately.
    signatures: [[0x52, 0x49, 0x46, 0x46]],
  },
  "image/gif": {
    extension: "gif",
    // GIF87a / GIF89a -> "GIF8"
    signatures: [[0x47, 0x49, 0x46, 0x38]],
  },
};

export const allowedImageMimeTypes = Object.keys(imageTypes);
