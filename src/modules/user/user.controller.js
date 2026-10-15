import { Router } from "express";
import * as userService from "./user.service.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { upload } from "../../utils/upload/multer.js";
import { withCache } from "../../middleware/withCache.middleware.js";

const router = Router();

router.get("/profile", authenticate, userService.getProfile);
router.get("/messages", authenticate, userService.getMyMessages);

// Upload / replace my profile picture (field name: "image").
router.post(
  "/profile/image",
  authenticate,
  upload().single("image"),
  userService.uploadProfileImage
);

// Public profile is cached in Redis for a short time (key per user id).
router.get(
  "/:id",
  withCache((req) => `user:${req.params.id}`),
  userService.getPublicProfile
);

export default router;
