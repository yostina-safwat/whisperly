import NodemailerProvider from "./nodemailerProvider.js";
import ConsoleProvider from "./consoleProvider.js";

/**
 * Factory design pattern.
 *
 * The rest of the app never does `new NodemailerProvider()` itself — it asks
 * the factory for "an email provider" and the factory decides which concrete
 * class to build (based on EMAIL_PROVIDER in .env). Adding a new provider
 * later (SendGrid, SES, ...) = add a class + one line in the map below.
 */
const providers = {
  gmail: NodemailerProvider,
  console: ConsoleProvider,
};

export const createEmailProvider = (type = process.env.EMAIL_PROVIDER || "gmail") => {
  const Provider = providers[type];
  if (!Provider) {
    throw new Error(
      `Unknown email provider "${type}". Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return new Provider();
};
