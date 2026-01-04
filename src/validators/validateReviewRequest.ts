import { NextFunction, Request, Response } from "express";

import { sendResponse } from "../utils/responseHelper.js";
import { reviewRequestZodSchema } from "../schemas/ReviewRequest.zod.js";
import { ZodError } from "zod";
const validateReviewRequest = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { status, requestId } = req.params;

	try {
		const validatedData = reviewRequestZodSchema.parse({
			requestId,
			status,
		});

		req.validatedData = validatedData;
		return next();
	} catch (err) {
		if (err instanceof ZodError) {
			return sendResponse(
				res,
				400,
				false,
				"Validation Error",
				null,
				err.errors.map((e) => ({
					field: e.path.join("."), // Converts ["firstName"] to "firstName"
					message: e.message,
				})),
			);
		}

		console.error("Unexpected Error:", err);
		return next(err);
	}
};

export default validateReviewRequest;
