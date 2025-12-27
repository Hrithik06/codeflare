import dotenv from "dotenv";
import path from "path";
import { envZodSchema } from "../schemas/EnvFile.zod.js";
import fs from "fs";
// Load environment variables from .env file

// Get the env
const nodeEnv = process.env.NODE_ENV || "development";
console.log("Running in : ", nodeEnv);
// Select env file based on NODE_ENV
const envFile =
	nodeEnv === "production" ? ".env.production" : ".env.development";
dotenv.config({
	path: path.resolve(envFile),
});

if (!fs.existsSync(envFile)) {
	throw new Error(`Missing env file: ${envFile}`);
}

//Zod check
const parsedEnv = envZodSchema.parse(process.env);

// Export config
export const config = {
	DB_USERNAME: parsedEnv.DB_USERNAME,
	DB_PASSWORD: parsedEnv.DB_PASSWORD,
	DB_CLUSTER: parsedEnv.DB_CLUSTER,
	ORIGIN: parsedEnv.ORIGIN,
	PORT: parsedEnv.PORT,
	JWT_SECRET_KEY: parsedEnv.JWT_SECRET_KEY,
	BREVO_API_KEY: parsedEnv.BREVO_API_KEY,
	SITE_ADMIN_EMAIL_FOR_BREVO: parsedEnv.SITE_ADMIN_EMAIL_FOR_BREVO,
	NO_REPLY_BREVO: parsedEnv.NO_REPLY_BREVO,
	CONTACT_FORM_NO_REPLY_BREVO: parsedEnv.CONTACT_FORM_NO_REPLY_BREVO,
	AWS_REGION: parsedEnv.AWS_REGION,
	S3_BUCKET: parsedEnv.S3_BUCKET,
	S3_READ_KEY: parsedEnv.S3_READ_KEY,
	S3_READ_SECRET: parsedEnv.S3_READ_SECRET,
	S3_UPLOAD_KEY: parsedEnv.S3_UPLOAD_KEY,
	S3_UPLOAD_SECRET: parsedEnv.S3_UPLOAD_SECRET,
};
