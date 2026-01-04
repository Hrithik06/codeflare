import { z } from "zod";
import { objectIdSchema } from "./ObjectId.zod.js";
const REVIEW_REQUEST_STATUS = ["accepted", "rejected"] as const;

export const reviewRequestZodSchema = z.object({
	requestId: objectIdSchema,
	status: z.enum(REVIEW_REQUEST_STATUS),
});
