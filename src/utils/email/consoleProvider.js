import EmailProvider from "./emailProvider.js";
import logger from "../logger/logger.js";

/**
 * ConsoleProvider — prints the email to the terminal instead of sending it.
 * Handy in development / testing when you don't want to hit Gmail.
 */
class ConsoleProvider extends EmailProvider {
  async send({ to, subject, html }) {
    // Strip the HTML so the OTP is easy to spot in the logs.
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    logger.info(`[email -> ${to}] ${subject} | ${text}`);
    return { messageId: `console-${Date.now()}` };
  }
}

export default ConsoleProvider;
