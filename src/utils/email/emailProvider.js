/**
 * EmailProvider — an ABSTRACTION (interface) for sending emails.
 *
 * This is the key to Dependency Inversion: high-level code (EmailService)
 * depends on this abstract contract, NOT on a concrete library like
 * Nodemailer. Swapping to SendGrid, Mailgun, SES, etc. later means writing
 * a new provider — no change to the service or the auth code.
 */
class EmailProvider {
  // Subclasses MUST implement this.
  async send(/* { to, subject, html } */) {
    throw new Error("send() must be implemented by an EmailProvider subclass");
  }
}

export default EmailProvider;
