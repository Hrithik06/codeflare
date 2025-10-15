import dotenv from "dotenv";
import path from "path";
import { envZodSchema } from "../schemas/EnvFile.zod.js";
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

// Zod check
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
};
