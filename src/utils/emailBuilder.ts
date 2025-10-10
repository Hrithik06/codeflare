import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmailReplyTo,
} from "@getbrevo/brevo";
import { config } from "../config/config.js";
const transactionalEmailsApi = new TransactionalEmailsApi();
transactionalEmailsApi.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  config.BREVO_API_KEY
);

async function sendPendingRequestEmail(toAddress: string, firstName: string) {
  try {
    const result = await transactionalEmailsApi.sendTransacEmail({
      to: [{ email: toAddress }],
      templateId: 1,
      params: { firstName: firstName },
      replyTo: { email: "no-reply@gittogether.xyz", name: "No Reply" },
      // subject: subject,
      // htmlContent: `<h1>${subject}</h1>`,
      // // textContent: subject,
      // sender: { email: "no-reply@gittogether.xyz", name: "GitTogether" },
    });
    console.log("Email sent! Message ID:", result.body.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export { sendPendingRequestEmail };
