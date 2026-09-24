import Joi from "joi";
import { Gender } from "../../DB/models/user.model.js";

const email = Joi.string().email().required();
const otp = Joi.string().length(6).pattern(/^\d+$/).required();
const password = Joi.string().min(6).max(64).required();

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email,
    password,
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "confirmPassword must match password",
    }),
    phone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).optional(),
    gender: Joi.string().valid(...Object.values(Gender)).optional(),
  }),
};

export const confirmEmailSchema = {
  body: Joi.object({ email, otp }),
};

export const loginSchema = {
  body: Joi.object({ email, password: Joi.string().required() }),
};

export const resendOtpSchema = {
  body: Joi.object({
    email,
    type: Joi.string().valid("confirmEmail", "forgotPassword").default("confirmEmail"),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({ email }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email,
    otp,
    newPassword: password,
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
      "any.only": "confirmPassword must match newPassword",
    }),
  }),
};
