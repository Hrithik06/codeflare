import { z } from "zod";
import { objectIdSchema } from "./ObjectId.zod.js";
import { firstNameSchema, lastNameSchema } from "./User.zod.js";
export const sendMessageSchema = z
	.object({
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		senderUserId: objectIdSchema,
		targetUserId: objectIdSchema,
		text: z
			.string()
			// .trim()
			.min(1, "Message cannot be empty")
			.max(2000, "Message too long"),
	})
	.refine((data) => data.senderUserId !== data.targetUserId, {
		message: "Cannot send message to yourself",
		path: ["targetUserId"],
	});
