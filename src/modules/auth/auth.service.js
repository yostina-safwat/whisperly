import User from "../../DB/models/user.model.js";
import Otp, { OtpTypes } from "../../DB/models/otp.model.js";
import AppError from "../../utils/error/appError.js";
import { asyncHandler } from "../../utils/error/errorHandler.js";
import { hashValue, compareValue } from "../../utils/security/hash.js";
import { generateToken } from "../../utils/security/token.js";
import { generateOtpCode, getOtpExpiry } from "../../utils/otp/otp.js";
import emailService from "../../utils/email/emailService.js";
import logger from "../../utils/logger/logger.js";

/** Create + store a hashed OTP and email it to the user. */
const issueOtp = async ({ email, name, type }) => {
  // Remove any previous OTPs of the same type for this email.
  await Otp.deleteMany({ email, type });

  const code = generateOtpCode();
  await Otp.create({
    email,
    otp: await hashValue(code),
    type,
    expiresAt: getOtpExpiry(),
  });

  await emailService.sendOtpEmail({
    to: email,
    name,
    otp: code,
    purpose: type,
  });
};

/** Verify a submitted OTP against the stored hash and consume it. */
const verifyOtp = async ({ email, otp, type }) => {
  const record = await Otp.findOne({ email, type }).sort({ createdAt: -1 });
  if (!record) {
    throw AppError.badRequest("No valid code found, please request a new one");
  }
  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    throw AppError.badRequest("Code expired, please request a new one");
  }
  const match = await compareValue(otp, record.otp);
  if (!match) {
    throw AppError.badRequest("Invalid verification code");
  }
  await Otp.deleteOne({ _id: record._id }); // one-time use
};

// POST /auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, gender } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw AppError.conflict("Email already registered");

  const user = await User.create({
    name,
    email,
    password: await hashValue(password),
    phone,
    gender,
  });

  await issueOtp({ email: user.email, name: user.name, type: OtpTypes.CONFIRM_EMAIL });

  res.status(201).json({
    success: true,
    message: "Registered successfully. Check your email for the confirmation code.",
    data: user,
  });
});

// POST /auth/confirm-email
export const confirmEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw AppError.notFound("User not found");
  if (user.isConfirmed) throw AppError.badRequest("Account already confirmed");

  await verifyOtp({ email, otp, type: OtpTypes.CONFIRM_EMAIL });

  user.isConfirmed = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Account confirmed successfully. You can now log in.",
  });
});

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw AppError.unauthorized("Invalid email or password");

  const match = await compareValue(password, user.password);
  if (!match) throw AppError.unauthorized("Invalid email or password");

  if (!user.isConfirmed) {
    throw AppError.forbidden("Please confirm your account before logging in");
  }

  const token = generateToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { token, user },
  });
});

// POST /auth/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const { email, type = OtpTypes.CONFIRM_EMAIL } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw AppError.notFound("User not found");
  if (type === OtpTypes.CONFIRM_EMAIL && user.isConfirmed) {
    throw AppError.badRequest("Account already confirmed");
  }

  await issueOtp({ email, name: user.name, type });

  res.status(200).json({
    success: true,
    message: "A new verification code has been sent to your email.",
  });
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Avoid leaking which emails exist: respond the same either way.
  if (user) {
    await issueOtp({ email, name: user.name, type: OtpTypes.FORGOT_PASSWORD });
  } else {
    logger.warn(`Forgot-password requested for unknown email: ${email}`);
  }

  res.status(200).json({
    success: true,
    message: "If that email exists, a reset code has been sent.",
  });
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw AppError.notFound("User not found");

  await verifyOtp({ email, otp, type: OtpTypes.FORGOT_PASSWORD });

  user.password = await hashValue(newPassword);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now log in.",
  });
});
