import { z } from "zod";

export const responseZodSchema = z.object({
  success: z.boolean(), // Success indicator
  message: z.string(), // Response message
  data: z.optional(z.any()), // Optional response data
  errors: z.optional(
    z.array(z.object({ field: z.string(), message: z.string() }))
  ), // Validation errors
});
