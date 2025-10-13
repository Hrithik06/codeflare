import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

//Ensure required Environemt Variables are set
const requiredEnvVariables = [
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_CLUSTER",
  "ORIGIN",
  "PORT",
  "JWT_SECRET_KEY",
  "BREVO_API_KEY",
  "SITE_ADMIN_EMAIL_FOR_BREVO",
  "NO_REPLY_BREVO",
  "CONTACT_FORM_NO_REPLY_BREVO",
];

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required Environment variable; ${key}`);
  }
});
//Export config oobject
export const config = {
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_CLUSTER: process.env.DB_CLUSTER as string,
  ORIGIN: process.env.ORIGIN as string,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as string,
  BREVO_API_KEY: process.env.BREVO_API_KEY as string,
  SITE_ADMIN_EMAIL_FOR_BREVO: process.env.SITE_ADMIN_EMAIL_FOR_BREVO as string,
  NO_REPLY_BREVO: process.env.NO_REPLY_BREVO as string,
  CONTACT_FORM_NO_REPLY_BREVO: process.env
    .CONTACT_FORM_NO_REPLY_BREVO as string,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};
