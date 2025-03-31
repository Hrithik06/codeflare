import { z } from "zod";
import validator from "validator";
export const emailIdZodSchema = z
  .string({ message: "Email is required" })
  .trim()
  .toLowerCase()
  .email({
    message: "Invalid email format",
  });
export const passwordZodSchema = z
  .string({ message: "Password is required." })
  .trim()
  .min(8, {
    message: "Password must be at least 8 characters",
  })
  .regex(/[A-Z]/, {
    message: "Password must include at least one uppercase",
  })
  .regex(/[a-z]/, {
    message: "Password must include at least one lowercase letter",
  })
  .regex(/[0-9]/, {
    message: "Password must include at least one number",
  })
  .regex(/[\W_]/, {
    message: "Password must include at least one special character",
  });

export const userZodSchema = z.object({
  firstName: z
    .string({ message: "First Name is required" })
    .trim()
    .min(2, {
      message: "First Name must be at least 2 characters",
    })
    .max(20, { message: "First name cannot exceed 20 characters" })
    .refine((value) => validator.isAlpha(value), {
      message: "Only alphabets allowed in First Name",
    }),
  lastName: z
    .string({ message: "Last Name is required" })
    .trim()
    .min(1, {
      message: "Last Name must be at least 1 characters",
    })
    .max(20, { message: "Last Name cannot exceed 20 characters" })
    .refine((value) => validator.isAlpha(value), {
      message: "Only alphabets allowed in Last Name",
    }),
  emailId: emailIdZodSchema,
  password: passwordZodSchema,
  dateOfBirth: z
    .string({ message: "Date of Birth is required" })
    .date("Please enter a valid date."),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Invalid gender. Allowed values: 'Male', 'Female', 'Other'.",
  }),
  about: z.string({ message: "About is required" }).trim(),
  skills: z
    .array(z.string({ message: "Skills is required" }))
    .min(1, { message: "Minimum 1 skill required" })
    .max(20, { message: "Maximum allowed skills are 20" }),
  photoUrl: z
    .string({ message: "Photo is required" })
    .trim()
    .url() // zod's url() allows localhost also
    .refine((value) => validator.isURL(value, { require_tld: true }), {
      //validator's isURL allows only https no localhost
      message: "Invalid URL",
    }),
});
