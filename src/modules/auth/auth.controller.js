import { Router } from "express";
import * as authService from "./auth.service.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  registerSchema,
  confirmEmailSchema,
  loginSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authService.register);
router.post("/confirm-email", validate(confirmEmailSchema), authService.confirmEmail);
router.post("/login", validate(loginSchema), authService.login);
router.post("/resend-otp", validate(resendOtpSchema), authService.resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), authService.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authService.resetPassword);

export default router;
