import { z } from "zod";
import { objectIdSchema } from "./ObjectId.zod.js";
import { firstNameSchema, lastNameSchema } from "./User.zod.js";
export const joinChatSchema = z
	.object({
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		senderUserId: objectIdSchema,
		targetUserId: objectIdSchema,
	})
	.refine((data) => data.senderUserId !== data.targetUserId, {
		message: "Cannot join chat with yourself",
		path: ["targetUserId"],
	});
