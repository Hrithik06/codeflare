import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import { sendResponse } from "../utils/responseHelper.js";
import { validateProfileEdit } from "../validators/index.js";
import { getDownloadUrl, getUploadUrl } from "../utils/aws_s3.js";

import User from "../models/user.js";
const profileRouter = express.Router();

profileRouter.get(
	"/profile/view",
	userAuth,
	async (req: Request, res: Response) => {
		try {
			const user = req?.user;
			sendResponse(res, 200, true, "Profile Data", user);
		} catch (err) {
			if (err instanceof Error) {
				return sendResponse(res, 500, false, "Internal server error");
			} else {
				return sendResponse(res, 500, false, "An unknown error occurred");
			}
		}
	},
);

profileRouter.patch(
	"/profile/edit",
	userAuth,
	validateProfileEdit,
	async (req: Request, res: Response) => {
		try {
			const loggedInUser = req.user;

			if (req.validatedData?.dateOfBirth) {
				req.validatedData.dateOfBirth = new Date(
					req.validatedData?.dateOfBirth,
				);
			}
			const updatedData = req.validatedData;
			const updatedUser = await User.findByIdAndUpdate(
				loggedInUser._id,
				updatedData,
				{ new: true, runValidators: true },
			);
			return sendResponse(
				res,
				200,
				true,
				`${updatedUser?.firstName}'s profile updated successfully`,
				updatedUser,
			);
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				if (err.name === "ValidationError") {
					const fieldErrors = Object.values((err as any).errors).map(
						(e: any) => ({
							field: e.path,
							message: e.message,
						}),
					);
					return sendResponse(
						res,
						400,
						false,
						"Validation Error",
						null,
						fieldErrors,
					);
				}
				return sendResponse(res, 500, false, "Internal server error");
			} else {
				return sendResponse(res, 500, false, "An unknown error occurred");
			}
		}
	},
);

//TODO: Implement password reset
profileRouter.patch(
	"/profile/password",
	userAuth,
	async (req: Request, res: Response) => {},
);

const allowImageType = ["image/png", "image/jpeg"];
profileRouter.post("/profile/upload-url", userAuth, async (req, res) => {
	try {
		let contentType = req.body.contentType;

		if (contentType === "image/jpg") {
			contentType = "image/jpeg";
		}

		if (!allowImageType.includes(contentType)) {
			console.info("Info: Unsupported File Format:", contentType);
			return sendResponse(
				res,
				415,
				false,
				"Only JPEG and PNG images are allowed",
			);
		}
		const userId = req.user._id.toString();
		const extension = contentType.split("/")[1];
		const profileImageKey = `profile-images/${userId}/profile.${extension}`;

		const s3UploadUrl = await getUploadUrl(profileImageKey);
		return sendResponse(res, 200, true, "S3 Presigned Upload URL", {
			s3UploadUrl,
			profileImageKey,
			contentType,
			expiresIn: 60 * 5, // seconds
		});
	} catch (caught) {
		console.log(caught);
	}
});

profileRouter.post("/profile/download-url", async (req, res) => {
	try {
		const profileImageKey = req.body.profileImageKey;
		const contentType = req.body.contentType;

		const s3DownloadUrl = await getDownloadUrl(profileImageKey);
		return sendResponse(res, 200, true, "S3 Presigned Download URL", {
			s3DownloadUrl,
			profileImageKey,
			contentType,
			expiresIn: 60 * 5, // seconds
		});
	} catch (err) {
		console.log(err);
		return sendResponse(res, 500, false, "Internal Server Error");
	}
});

export default profileRouter;
