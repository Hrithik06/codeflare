import { z } from "zod";
import { objectIdSchema } from "./ObjectId.zod.js";
const REQUEST_STATUS = ["interested", "ignored"] as const;

export const connectionRequestZodSchema = z.object({
	toUserId: objectIdSchema,
	status: z.enum(REQUEST_STATUS),
});
