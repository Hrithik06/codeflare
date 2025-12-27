import { z } from "zod";
import mongoose from "mongoose";
const REQUEST_STATUS = ["interested", "ignored"] as const;
const objectIdSchema = z
	.string()
	.trim()
	.refine((val) => mongoose.Types.ObjectId.isValid(val), {
		message: "Invalid ObjectId format",
	});

export const connectionRequestZodSchema = z.object({
	toUserId: objectIdSchema,
	status: z.enum(REQUEST_STATUS),
});
