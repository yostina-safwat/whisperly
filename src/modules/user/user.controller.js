import { Router } from "express";
import * as userService from "./user.service.js";
import { authenticate } from "../../middleware/authentication.middleware.js";

const router = Router();

router.get("/profile", authenticate, userService.getProfile);
router.get("/messages", authenticate, userService.getMyMessages);
router.get("/:id", userService.getPublicProfile);

export default router;
