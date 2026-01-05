import express, { Request, Response } from "express";
import { z } from "zod";

import userAuth from "../middlewares/userAuth.js";
import validateContactUs from "../validators/validateContactUs.js";
import { sendContactFormToOwner } from "../utils/emailBuilder.js";
import { sendResponse } from "../utils/responseHelper.js";
import { contactUsZodSchema } from "../schemas/ContactUs.zod.js";

type ContactUsInput = z.infer<typeof contactUsZodSchema>;

const contactUsRouter = express.Router();
contactUsRouter.post(
	"/contact-us",
	userAuth,
	validateContactUs,
	async (req: Request, res: Response) => {
		try {
			const loggedInUser = req.user;

			if (!loggedInUser) {
				return sendResponse(res, 401, false, "Unauthorized: Please Login");
			}
			const { emailId, _id, firstName, lastName } = loggedInUser;
			const { subject, message } = req.validatedData as ContactUsInput;

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
