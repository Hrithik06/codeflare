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
	BREVO_API_KEY: z.string(),
	SITE_ADMIN_EMAIL_FOR_BREVO: z.string().email(),
	NO_REPLY_BREVO: z.string().email(),
	CONTACT_FORM_NO_REPLY_BREVO: z.string().email(),
	AWS_REGION: z.string(),
	S3_BUCKET: z.string(),
	S3_READ_KEY: z.string(),
	S3_READ_SECRET: z.string(),
	S3_UPLOAD_KEY: z.string(),
	S3_UPLOAD_SECRET: z.string(),
});
