import { Request, Response, NextFunction } from "express";
import { profileEditBackendSchema } from "../schemas/User.zod.js";
import { ZodError } from "zod";
import { sendResponse } from "../utils/responseHelper.js";
//making all fields of user schema as optional for patch/update request

const validateProfileEdit = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		// const { emailId, password } = req.body;
		// //Early return if user is trying to update emailId or password
		// if (emailId || password) {
		// 	return sendResponse(
		// 		res,
		// 		400,
		// 		false,
		// 		"You cannot update email or password.",
		// 	);
		// }
		const validatedData = profileEditBackendSchema.parse(req.body);
		req.validatedData = validatedData;
		return next();
	} catch (err) {
		if (err instanceof ZodError) {
			console.log("Validation Error:", err.message);
			//Return a structured JSON response with an array of errors

			return sendResponse(
				res,
				400,
				false,
				"Validation Failed",
				null,
				err.errors.map((e) => ({
					field: e.path.join("."), // Converts ["firstName"] to "firstName"
					message: e.message,
				})),
			);
		}
		//Error other than zod errors send it to express route to handle
		console.error("Unexpected Error:", err);
		return next(err);
	}
};
export default validateProfileEdit;
