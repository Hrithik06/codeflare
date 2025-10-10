import { z } from "zod";

export const contactUsZodSchema = z.object({
  subject: z.string(), // Success indicator
  message: z.string(), // Response message
});
