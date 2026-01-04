import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/responseHelper.js";
import { ZodError } from "zod";
import { profileImageUploadZodSchema } from "../schemas/ProfileImageUpload.zod.js";
const validateProfileImageUpload = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedData = profileImageUploadZodSchema.parse(req.body);
		req.validatedData = validatedData;
		next();
	} catch (err) {
		if (err instanceof ZodError) {
			return sendResponse(
				res,
				415,
				false,
				"Only JPEG and PNG images are allowed",
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
export default validateProfileImageUpload;
