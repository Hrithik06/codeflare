import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/responseHelper.js";
import { ZodError } from "zod";
import { profileImageConfirmZodSchema } from "../schemas/ProfileImageConfirm.zod.js";
const validateProfileImageConfirm = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedData = profileImageConfirmZodSchema.parse(req.body);
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
		return next(err);
	}
};
export default validateProfileImageConfirm;
