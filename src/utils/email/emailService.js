import NodemailerProvider from "./nodemailerProvider.js";
import { otpEmailTemplate } from "./emailTemplate.js";
import logger from "../logger/logger.js";

/**
 * EmailService — high-level email use-cases.
 *
 * Dependency Inversion in action: the service receives an EmailProvider
 * (an abstraction) through its constructor and never references Nodemailer
 * directly. You can inject any provider — including a fake one in tests.
 */
class EmailService {
  constructor(provider) {
    this.provider = provider;
  }

  async sendOtpEmail({ to, name, otp, purpose }) {
    const subject =
      purpose === "forgotPassword"
        ? "Whisperly - Password reset code"
        : "Whisperly - Account confirmation code";

    try {
      await this.provider.send({
        to,
        subject,
        html: otpEmailTemplate({ name, otp, purpose }),
      });
    } catch (error) {
      // Don't crash the request if the mail server hiccups; log it instead.
      logger.error(`Failed to send OTP email to ${to}: ${error.message}`);
      throw error;
    }
  }
}

// Compose the default instance with the concrete Nodemailer provider.
const emailService = new EmailService(new NodemailerProvider());
export default emailService;
export { EmailService };
