import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/responseHelper.js";
import { ZodError } from "zod";
import { connectionRequestZodSchema } from "../schemas/ConnectionRequest.zod.js";
const validateConnectionRequest = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { toUserId, status } = req.params;

	try {
		const validatedData = connectionRequestZodSchema.parse({
			toUserId,
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
export default validateConnectionRequest;
