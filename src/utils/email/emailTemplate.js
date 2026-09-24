/** Simple, branded HTML template for OTP emails. */
export const otpEmailTemplate = ({ name, otp, purpose }) => {
  const title =
    purpose === "forgotPassword"
      ? "Reset your Whisperly password"
      : "Confirm your Whisperly account";

  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border:1px solid #eee; border-radius:12px;">
    <h2 style="color:#6C5CE7; margin-bottom: 4px;">Whisperly 🤫</h2>
    <p style="color:#333;">Hi ${name || "there"},</p>
    <p style="color:#333;">${title}. Use the verification code below:</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align:center; background:#f4f2ff; color:#6C5CE7; padding: 16px; border-radius: 8px; margin: 16px 0;">
      ${otp}
    </div>
    <p style="color:#777; font-size: 13px;">This code will expire soon. If you didn't request it, you can safely ignore this email.</p>
    <p style="color:#aaa; font-size: 12px; margin-top: 24px;">— The Whisperly Team</p>
  </div>`;
};
