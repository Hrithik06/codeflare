import express, { Request, Response } from "express";
import { z } from "zod";

import userAuth from "../middlewares/userAuth.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
import UserModel, { UserDocument } from "../models/user.js";
import {
	validateConnectionRequest,
	validateReviewRequest,
} from "../validators/index.js";
import { sendResponse } from "../utils/responseHelper.js";
import { connectionRequestZodSchema } from "../schemas/ConnectionRequest.zod.js";
import { reviewRequestZodSchema } from "../schemas/ReviewRequest.zod.js";
const requestRouter = express.Router();
export const getIncompleteProfileFields = (user: UserDocument) => {
	const missing = [];

	if (user.skills.length === 0) missing.push("skills");
	if (!user.profileImageMeta?.isUserUploaded) missing.push("profileImage");
	if (!user.dateOfBirth) missing.push("dateOfBirth");
	if (!user.gender) missing.push("gender");
	if (!user.about?.trim()) missing.push("about");

	return missing;
};

type ConnectionRequestInput = z.infer<typeof connectionRequestZodSchema>;

requestRouter.post(
	"/request/send/:status/:toUserId",
	userAuth,
	validateConnectionRequest,
	async (req: Request, res: Response) => {
		try {
			const loggedInUser = req.user;

			if (!loggedInUser) {
				return sendResponse(res, 401, false, "Unauthorized: Please Login");
			}
			const fromUserId = loggedInUser._id;

			const { toUserId, status } = req.validatedData as ConnectionRequestInput;

			const missing = getIncompleteProfileFields(loggedInUser);
			// If any of the fielda in user are not present
			if (missing.length > 0)
				return sendResponse(
					res,
					403,
					false,
					"Complete your profile to send requests",
					missing,
				);

			//First check whether toUser exists or not?
			const toUserExists = await UserModel.findById(toUserId);
			if (!toUserExists) {
				return sendResponse(res, 404, false, "User not found", null, [
					{ field: "toUserId", message: "User does not exist" },
				]);
			}

			//using or condition to check if there is already request between users userA->userB or userB->userA
			const existingConnection = await ConnectionRequestModel.findOne({
				$or: [
					{ fromUserId, toUserId },
					{ fromUserId: toUserId, toUserId: fromUserId },
				],
			});

			if (existingConnection) {
				//Construct message according the fromUserId and toUserId
				const message = existingConnection.fromUserId.equals(
					fromUserId.toString(),
				)
					? `You have already sent a request to ${
							toUserExists.firstName
						} with status: ${existingConnection.status.toUpperCase()}`
					: `You have already received a request from ${
							toUserExists.firstName
						} with status: ${existingConnection.status.toUpperCase()}`;

				if (existingConnection.status === status) {
					return sendResponse(res, 409, false, message);
				}
				if (existingConnection.status === "accepted") {
					return sendResponse(
						res,
						409,
						false,
						`${toUserExists.firstName} is already in your connection`,
					);
				}
				//FIXME:Better handling of requests which have been rejected.
				//This should not happen as in the feed we do not show profile once it is rejected by either of the user.
				return sendResponse(res, 409, false, `Connection rejected`);
				// Not changing status once ignored
				//CASE: What if userA sends userB "ignored", but userB sends userA "interested"
			}

			//Create a new connection request in DB
			const newConnectionRequest = new ConnectionRequestModel({
				fromUserId,
				toUserId,
				status,
			});
			await newConnectionRequest.save();

			const message =
				status === "interested"
					? `You are interested in ${toUserExists.firstName}`
					: `You ignored ${toUserExists.firstName}`;
			return sendResponse(res, 200, true, message, newConnectionRequest);
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error occurred: ", err.message);
				return sendResponse(res, 500, false, "Internal server error");
			}
			return sendResponse(res, 500, false, "Unexpected Error");
		}
	},
);
type ReviewRequestInput = z.infer<typeof reviewRequestZodSchema>;

requestRouter.post(
	"/request/review/:status/:requestId",
	userAuth,
	validateReviewRequest, //zod handles allowed values and requestId
	async (req: Request, res: Response) => {
		try {
			const loggedInUser = req.user;

			if (!loggedInUser) {
				return sendResponse(res, 401, false, "Unauthorized: Please Login");
			}
			const toUserId = loggedInUser._id;
			const { status, requestId } = req.validatedData as ReviewRequestInput;

			const existingConnection = await ConnectionRequestModel.findOne({
				_id: requestId,
				toUserId,
				status: "interested",
			});
			//If there is no Request present in DB
			if (!existingConnection) {
				return sendResponse(res, 404, false, "No Request Found");
			} else {
				existingConnection.status = status;
				await existingConnection.save();
				return sendResponse(
					res,
					200,
					true,
					`Request ${status} successfully`, //accepted or rejected
					existingConnection,
				);
			}
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error occurred: ", err.message);
				return sendResponse(res, 400, false, `ERROR: ${err.message}`);
			}
			return sendResponse(res, 500, false, "Unexpected Error");
		}
	},
);

export default requestRouter;
