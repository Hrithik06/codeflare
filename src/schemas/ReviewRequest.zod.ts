import mongoose from "mongoose";
import { z } from "zod";

const REVIEW_REQUEST_STATUS = ["accepted", "rejected"] as const;

const objectIdSchema = z
	.string()
	.trim()
	.refine((val) => mongoose.Types.ObjectId.isValid(val), {
		message: "Invalid ObjectId format",
	});
export const reviewRequestZodSchema = z.object({
	requestId: objectIdSchema,
	status: z.enum(REVIEW_REQUEST_STATUS),
});
