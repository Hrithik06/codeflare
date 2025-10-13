import { z } from "zod";

export const contactUsZodSchema = z.object({
  subject: z
    .string()
    .min(10, {
      message: "Subject must be at least 10 characters.",
    })
    .max(200, { message: "Subject cannot exceed 60 characters." }), // Success indicator
  message: z
    .string()
    .min(10, {
      message: "Message must be at least 10 characters.",
    })
    .max(300, { message: "Message cannot exceed 300 characters." }), // Response message
});
