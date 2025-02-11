import { z } from "zod";

export const userZodSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  lastName: z.string().min(1, {
    message: "First name must be at least 1 character",
  }),
  email: z.string().email({
    message: "Invalid email format",
  }),
  password: z
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
    }),
  age: z
    .number()
    .min(15, { message: "You must be at least 15 years old" })
    .max(120, { message: "Invalid age" }),
  gender: z.enum(["male", "female", "other"], { message: "Invalid gender" }),
});
