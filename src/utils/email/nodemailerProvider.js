import nodemailer from "nodemailer";
import EmailProvider from "./emailProvider.js";
import logger from "../logger/logger.js";

/**
 * NodemailerProvider — a CONCRETE implementation of EmailProvider that
 * uses Nodemailer + Gmail (App Password). It "inherits" the contract and
 * fills in the details.
 */
class NodemailerProvider extends EmailProvider {
  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send({ to, subject, html }) {
    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} (id: ${info.messageId})`);
    return info;
  }
}

export default NodemailerProvider;
