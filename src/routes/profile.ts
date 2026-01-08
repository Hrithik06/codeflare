import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import { sendResponse } from "../utils/responseHelper.js";
import {
	validateProfileEdit,
	validateProfileImageUpload,
	validateProfileImageConfirm,
} from "../validators/index.js";
import { getDownloadUrl, getUploadUrl } from "../utils/aws_s3.js";

import UserModel from "../models/user.js";
import { profileEditBackendSchema } from "../schemas/User.zod.js";
import { z } from "zod";
import { profileImageConfirmZodSchema } from "../schemas/ProfileImageConfirm.zod.js";
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
type ProfileEditInput = z.infer<typeof profileEditBackendSchema>;

profileRouter.patch(
	"/profile/edit",
	userAuth,
	validateProfileEdit,
	async (req: Request, res: Response) => {
		try {
			const loggedInUser = req.user;

			if (!loggedInUser) {
				return sendResponse(res, 401, false, "Unauthorized: Please Login");
			}
			const userId = loggedInUser._id;

			const updatedData = req.validatedData as ProfileEditInput;
			const updatedUser = await UserModel.findByIdAndUpdate(
				userId,
				updatedData,
				{
					new: true,
					runValidators: true,
				},
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
// profileRouter.patch(
// 	"/profile/password",
// 	userAuth,
// 	async (req: Request, res: Response) => {},
// );

const allowImageType = ["image/png", "image/jpeg"];
profileRouter.post(
	"/profile/upload-url",
	userAuth,
	validateProfileImageUpload,
	async (req: Request, res: Response) => {
		try {
			let { contentType } = req.validatedData as {
				contentType: "image/jpeg" | "image/png" | "image/jpg";
			};

			if (contentType === "image/jpg") {
				contentType = "image/jpeg";
			}

			//I think this will not be required as  we are validating in zod
			if (!allowImageType.includes(contentType)) {
				console.info("Info: Unsupported File Format:", contentType);
				return sendResponse(
					res,
					415,
					false,
					"Only JPEG and PNG images are allowed",
				);
			}
			const userId = req.user?._id;
			const extension = contentType.split("/")[1];
			const key = `profile-images/${userId}/profile.${extension}`;

			const s3UploadUrl = await getUploadUrl(key);

			return sendResponse(res, 200, true, "S3 Presigned Upload URL", {
				s3UploadUrl,
				key,
				contentType,
				expiresIn: 60 * 5, // seconds
			});
		} catch (err) {
			console.log(err);
			return sendResponse(res, 500, false, "Internal Server Error");
		}
	},
);

type ImageConfirmInput = z.infer<typeof profileImageConfirmZodSchema>;

profileRouter.post(
	"/profile/image/confirm",
	userAuth,
	validateProfileImageConfirm,
	async (req: Request, res: Response) => {
		try {
			const loggedInUser = req.user;

			if (!loggedInUser) {
				return sendResponse(res, 401, false, "Unauthorized: Please Login");
			}
			const userId = loggedInUser._id;
			const { key, contentType } = req.validatedData as ImageConfirmInput;

			// if (req.validatedData?.dateOfBirth) {
			// 	req.validatedData.dateOfBirth = new Date(req.validatedData?.dateOfBirth);
			// }
			const updatedData = {
				profileImageMeta: {
					key,
					contentType,
					isUserUploaded: true,
					imageVersion: Date.now(),
				},
			};

			const updatedUser = await UserModel.findByIdAndUpdate(
				userId,
				updatedData,
				{
					new: true,
					runValidators: true,
				},
			);

			return sendResponse(
				res,
				200,
				true,
				"Profile Image Meta Data Updated",
				updatedUser,
			);
		} catch (err) {
			console.log(err);
			return sendResponse(res, 500, false, "Internal Server Error");
		}
	},
);
profileRouter.post("/profile/download-url", userAuth, async (req, res) => {
	try {
		//can be improved by fetching key and contentType like in profile-view
		// const user = req?.user;

		const key = req.body.key;
		const contentType = req.body.contentType;

		const s3DownloadUrl = await getDownloadUrl(key);

		return sendResponse(res, 200, true, "S3 Presigned Download URL", {
			s3DownloadUrl,
			key,
			contentType,
			expiresIn: 60 * 5, // seconds
		});
	} catch (err) {
		console.log(err);
		return sendResponse(res, 500, false, "Internal Server Error");
	}
});

export default profileRouter;
