import { z } from "zod";

export const envZodSchema = z.object({
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_CLUSTER: z.string(),
  ORIGIN: z.string().url(),
  JWT_SECRET_KEY: z.string(),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: "PORT must be a number" }),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  BREVO_API_KEY: z.string(),
  SITE_ADMIN_EMAIL_FOR_BREVO: z.string().email(),
  NO_REPLY_BREVO: z.string().email(),
  CONTACT_FORM_NO_REPLY_BREVO: z.string().email(),
});
