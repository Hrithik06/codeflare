import { z } from "zod";
import validator from "validator";
export const emailZodSchema = z.string().toLowerCase().email({
  message: "Invalid email format",
});
export const passwordZodSchema = z
  .string()
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
    .string()
    .min(2, {
      message: "First name must be at least 2 characters",
    })
    .max(20, { message: "First name cannot exceed 20 characters" }),

  lastName: z
    .string()
    .min(1, {
      message: "Last name must be at least 1 character",
    })
    .max(20, { message: "Last name cannot exceed 20 characters" }),
  emailId: emailZodSchema,
  password: passwordZodSchema,
  age: z
    .number()
    .min(15, { message: "You must be at least 15 years old" })
    .max(120, { message: "Invalid age" }),
  gender: z.enum(["male", "female", "other"], {
    message: "Invalid gender. Allowed values: 'male', 'female', 'other'.",
  }),
  photoUrl: z
    .string()
    .url()// zod's url() allows localhost also
    .refine((value) => validator.isURL(value, { require_tld: true }), {//validator's isURL allows only https no localhost
      message: "Invalid URL",
    })
    .optional(),

  about: z.string().optional(),
  skills: z
    .array(z.string())
    .max(20, { message: "Maximum allowed skills are 2" })
    .optional(),
});
