import { Router } from "express";
import * as conversationService from "./conversation.service.js";
import { validate } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import {
  conversationIdSchema,
  sendConversationMessageSchema,
} from "./conversation.validation.js";

const router = Router();

router.use(authenticate);

router.get("/", conversationService.getMyConversations);
router.get(
  "/:id/messages",
  validate(conversationIdSchema),
  conversationService.getConversationMessages
);
router.post(
  "/:id/messages",
  validate(sendConversationMessageSchema),
  conversationService.sendConversationMessage
);

export default router;
