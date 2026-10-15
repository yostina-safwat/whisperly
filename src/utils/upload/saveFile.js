import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import AppError from "../error/appError.js";
import { imageTypes } from "./fileTypes.js";

const UPLOADS_ROOT = "uploads";

/** Check a file buffer against the magic numbers for its declared mime type. */
const isValidMagicNumber = (buffer, mimetype) => {
  const type = imageTypes[mimetype];
  if (!type) return false;

  const matchesSignature = type.signatures.some((signature) =>
    signature.every((byte, index) => buffer[index] === byte)
  );

  // WEBP needs an extra check: "WEBP" marker at bytes 8-11.
  if (mimetype === "image/webp") {
    const webpMarker = buffer.slice(8, 12).toString("ascii");
    return matchesSignature && webpMarker === "WEBP";
  }

  return matchesSignature;
};

/**
 * Validate a multer file (magic numbers) and persist it to disk.
 * Returns the public path to store in the DB, e.g. "uploads/users/ab12.jpg".
 */
export const saveFile = async (file, folder = "misc") => {
  if (!file) throw AppError.badRequest("No file uploaded");

  if (!isValidMagicNumber(file.buffer, file.mimetype)) {
    throw AppError.badRequest(
      "File content does not match its type (possible fake file)"
    );
  }

  const extension = imageTypes[file.mimetype].extension;
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  const relativeDir = path.posix.join(UPLOADS_ROOT, folder);
  const relativePath = path.posix.join(relativeDir, fileName);

  await fs.mkdir(relativeDir, { recursive: true });
  await fs.writeFile(relativePath, file.buffer);

  return relativePath;
};

/** Delete a previously stored file (ignores a missing file). */
export const deleteFile = async (relativePath) => {
  if (!relativePath) return;
  try {
    await fs.unlink(relativePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};
