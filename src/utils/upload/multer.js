import multer from "multer";
import AppError from "../error/appError.js";
import { allowedImageMimeTypes } from "./fileTypes.js";

/**
 * Multer upload factory (in-memory storage).
 *
 * We keep the file in memory (buffer) so we can validate its real content
 * (magic numbers) BEFORE writing anything to disk. The file filter here is
 * the first, cheap guard (checks the declared mime type).
 *
 * Usage:
 *   upload().single("image")
 *   upload().array("images", 5)
 *   upload().fields([{ name: "avatar", maxCount: 1 }])
 */
export const upload = (allowedMimeTypes = allowedImageMimeTypes, maxSizeMB = 5) => {
  const fileFilter = (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        AppError.badRequest(
          `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
        ),
        false
      );
    }
    cb(null, true);
  };

  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};
