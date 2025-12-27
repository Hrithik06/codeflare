import { z } from "zod";

export const responseZodSchema = z.object({
	success: z.boolean(), // Success indicator
	message: z.string(), // Response message
	data: z.optional(z.any()), // Optional response data
	errors: z
		.array(z.object({ field: z.string().optional(), message: z.string() }))
		.optional(), // Validation errors
});
