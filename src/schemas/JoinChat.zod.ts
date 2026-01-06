import { z } from "zod";
import { objectIdSchema } from "./ObjectId.zod.js";

export const joinChatSchema = z.object({
	chatId: objectIdSchema,
	// targetUserId: objectIdSchema,
});
