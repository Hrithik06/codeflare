import { z } from "zod";

export const reviewRequestZodSchema = z.object({
  requestId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid fromUserId format",
  }), // Validate ObjectId format
  status: z.enum(["accepted", "rejected"]),
});
