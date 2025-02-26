import { z } from "zod";

export const connectionRequestZodSchema = z.object({
    fromUserId: z.string().regex(/^[0-9a-fA-F]{24}$/), // Validate ObjectId format
    toUserId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    status: z.enum(["interested", "ignored", "accepted", "rejected"])
});
