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

const profilImageMetaZodSchema = z.object({
	key: z.string({ message: "Profile Image Key is required" }).trim(),
	contentType: z
		.string({ message: "Profile Image ContentType is required" })
		.trim(),
	isUserUploaded: z.boolean(),
	imageVersion: z.number(),
});

export const baseUserZodSchema = z.object({
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
});
export const userZodSchema = baseUserZodSchema.extend({
	dateOfBirth: z
		.string({ message: "Date of Birth is required" })
		.date("Please enter a valid date."),
	gender: z.enum(["Man", "Woman", "Non-binary"], {
		message: "Invalid gender. Allowed values: 'Man', 'Woman', 'Non-binary'.",
	}),
	about: z
		.string({ message: "About is required" })
		.trim()
		.min(10, {
			message: "About must be at least 10 characters.",
		})
		.max(200, { message: "About cannot exceed 200 characters." }),
	skills: z
		.array(z.string({ message: "Skills is required" }))
		.min(1, { message: "Minimum 1 skill required." })
		.max(20, { message: "Maximum allowed skills are 20." }),
	profileImageMeta: profilImageMetaZodSchema,
});
