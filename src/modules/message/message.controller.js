import { Router } from "express";
import * as messageService from "./message.service.js";
import { validate } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { messageLimiter } from "../../middleware/rateLimiter.middleware.js";
import { sendMessageSchema, messageIdSchema } from "./message.validation.js";

const router = Router();

// Public: send an anonymous whisper to a user.
router.post(
  "/:receiverId",
  messageLimiter,
  validate(sendMessageSchema),
  messageService.sendMessage
);

// Protected: delete one of my received whispers.
router.delete("/:id", authenticate, validate(messageIdSchema), messageService.deleteMessage);

export default router;
