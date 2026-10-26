import { Router } from "express";
import * as authService from "./auth.service.js";
import { validate } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import {
  registerSchema,
  confirmEmailSchema,
  loginSchema,
  verifyLoginSchema,
  confirmTwoStepSchema,
  disableTwoStepSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authService.register);
router.post("/confirm-email", validate(confirmEmailSchema), authService.confirmEmail);
router.post("/login", validate(loginSchema), authService.login);
router.post("/login/verify", validate(verifyLoginSchema), authService.verifyLogin);
router.post("/resend-otp", validate(resendOtpSchema), authService.resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), authService.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authService.resetPassword);

// Two-step verification (logged-in user)
router.patch("/two-step/enable", authenticate, authService.enableTwoStep);
router.post("/two-step/confirm", authenticate, validate(confirmTwoStepSchema), authService.confirmTwoStep);
router.patch("/two-step/disable", authenticate, validate(disableTwoStepSchema), authService.disableTwoStep);

export default router;
