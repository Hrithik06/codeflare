import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendResponse } from "../utils/responseHelper.js";
import { objectIdSchema } from "../schemas/ObjectId.zod.js";
const validatePathId = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const { targetUserId } = req.params;
	try {
		const validatedData = objectIdSchema.parse(targetUserId);
		req.validatedData = validatedData;
		next();
	} catch (err) {
		if (err instanceof ZodError) {
			return sendResponse(
				res,
				400,
				false,
				"Invalid image confirmation data",
				null,
				err.errors.map((e) => ({
					field: e.path.join("."),
					message: e.message,
				})),
			);
		}
		return next();
	}
};
export default validatePathId;
