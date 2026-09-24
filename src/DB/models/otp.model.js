import mongoose from "mongoose";

export const OtpTypes = {
  CONFIRM_EMAIL: "confirmEmail",
  FORGOT_PASSWORD: "forgotPassword",
};

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Hashed OTP code (never store the plain code).
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(OtpTypes),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB auto-removes the document once expiresAt passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default Otp;
