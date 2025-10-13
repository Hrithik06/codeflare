import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmailReplyTo,
} from "@getbrevo/brevo";
import { config } from "../config/config.js";
import {
  BaseEmailRecipient,
  AdminEmailRecipient,
} from "../types/dbInterfaces.js";
const transactionalEmailsApi = new TransactionalEmailsApi();
transactionalEmailsApi.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  config.BREVO_API_KEY
);

async function sendPendingRequestEmail(params: BaseEmailRecipient) {
  try {
    const { emailId, firstName, lastName } = params;
    const result = await transactionalEmailsApi.sendTransacEmail({
      to: [{ email: emailId }],
      templateId: 1,
      params: { firstName: firstName, lastName: lastName },
      replyTo: { email: config.NO_REPLY_BREVO, name: "No Reply" },
    });
    console.log("Email sent! Message ID:", result.body.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

async function sendContactFormToOwner(params: AdminEmailRecipient) {
  try {
    const { userId, emailId, firstName, lastName, subject, message } = params;
    const result = await transactionalEmailsApi.sendTransacEmail({
      to: [{ email: config.SITE_ADMIN_EMAIL_FOR_BREVO }],
      replyTo: {
        email: config.CONTACT_FORM_NO_REPLY_BREVO,
        name: "Contact Form No Reply",
      },
      templateId: 2,
      params: {
        userId: userId,
        emailId: emailId,
        firstName: firstName,
        lastName: lastName,
        subject: subject,
        message: message,
      },
    });
    console.log("Email sent! Message ID:", result.body.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
export { sendPendingRequestEmail, sendContactFormToOwner };
