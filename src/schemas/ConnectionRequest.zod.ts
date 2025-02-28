import { z } from "zod";

export const connectionRequestZodSchema = z.object({
  fromUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid fromUserId format",
  }), // Validate ObjectId format
  toUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid toUserId format",
  }),
  status: z.enum(["interested", "ignored"]),
});
