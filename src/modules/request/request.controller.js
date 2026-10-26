import { Router } from "express";
import * as requestService from "./request.service.js";
import { validate } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import {
  sendRequestSchema,
  requestIdSchema,
  respondToRequestSchema,
} from "./request.validation.js";

const router = Router();

// Everything here needs a logged-in user.
router.use(authenticate);

router.get("/", requestService.getReceivedRequests);
router.get("/sent", requestService.getSentRequests);
router.post("/:receiverId", validate(sendRequestSchema), requestService.sendRequest);
router.patch("/:id", validate(respondToRequestSchema), requestService.respondToRequest);
router.delete("/:id", validate(requestIdSchema), requestService.cancelRequest);

export default router;
