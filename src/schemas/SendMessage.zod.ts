import { z } from "zod";
import { objectIdSchema } from "./ObjectId.zod.js";
export const sendMessageSchema = z.object({
	targetUserId: objectIdSchema,
	text: z
		.string()
		// .trim()
		.min(1, "Message cannot be empty")
		.max(2000, "Message too long"),
});
