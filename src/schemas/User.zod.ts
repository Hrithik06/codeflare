import { z } from "zod";
import validator from "validator";
const emailIdZodSchema = z
	.string({ message: "Email is required" })
	.trim()
	.toLowerCase()
	.email({
		message: "Invalid email format",
	});
const passwordZodSchema = z
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

export const firstNameSchema = z
	.string({ message: "First Name is required" })
	.trim()
	.min(2, {
		message: "First Name must be at least 2 characters",
	})
	.max(20, { message: "First name cannot exceed 20 characters" })
	.refine((value) => validator.isAlpha(value), {
		message: "Only alphabets allowed in First Name",
	});

export const lastNameSchema = z
	.string({ message: "Last Name is required" })
	.trim()
	.min(1, {
		message: "Last Name must be at least 1 characters",
	})
	.max(20, { message: "Last Name cannot exceed 20 characters" })
	.refine((value) => validator.isAlpha(value), {
		message: "Only alphabets allowed in Last Name",
	});

export const signupZodSchema = z.object({
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	emailId: emailIdZodSchema,
	password: passwordZodSchema,
});

export const loginZodSchema = z.object({
	emailId: emailIdZodSchema,
	password: passwordZodSchema,
});

const profileEditBaseSchema = z.object({
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	dateOfBirth: z.coerce.date(),
	gender: z.enum(["Man", "Woman", "Non-binary"], {
		message: "Please select a gender.",
	}),
	about: z.string().trim().min(10).max(200),
	skills: z.array(z.string().trim().min(1)).min(1).max(20),
});

export const profileEditBackendSchema = profileEditBaseSchema
	.partial()
	.strict();
