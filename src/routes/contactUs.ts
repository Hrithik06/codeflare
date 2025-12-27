import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import validateContactUs from "../validators/validateContactUs.js";
import { sendContactFormToOwner } from "../utils/emailBuilder.js";
import { sendResponse } from "../utils/responseHelper.js";

const contactUsRouter = express.Router();
contactUsRouter.post(
	"/contact-us",
	userAuth,
	validateContactUs,
	async (req: Request, res: Response) => {
		try {
			const { emailId, _id, firstName, lastName } = req.user;
			const { subject, message } = req.validatedData;

			await sendContactFormToOwner({
				emailId,
				firstName,
				lastName,
				userId: _id.toString(),
				subject,
				message,
			});

			return sendResponse(res, 200, true, "Message sent successfully");
		} catch (err) {
			console.error(err);
			return sendResponse(
				res,
				500,
				false,
				"Failed to send message. Please try again later.",
			);
		}
	},
);

export default contactUsRouter;
