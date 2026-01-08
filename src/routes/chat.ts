import express, { Request, Response } from "express";
import validatePathId from "../validators/validatePathId.js";
import userAuth from "../middlewares/userAuth.js";
import { objectIdSchema } from "../schemas/ObjectId.zod.js";
import ChatModel from "../models/chat.js";
import { sendResponse } from "../utils/responseHelper.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
//TODO: messages can grow a lot in DB, limit those messages on api calls
//TODO: fetch more only when scrolled up, build pagination when scrolled show 20msgs first then 20 next
const chatRouter = express.Router();
chatRouter.get(
	"/chat/:targetUserId",
	// validatePathId,//TODO:validate targetUserId
	userAuth,
	async (req: Request, res: Response) => {
		try {
			const userId = req.user._id;
			const { targetUserId } = req.params;
			//Check if both users are connected and status is accepted then only let them to chat
			const connectionAccepted = await ConnectionRequestModel.findOne({
				status: "accepted",
				$or: [
					{ fromUserId: userId, toUserId: targetUserId },
					{ fromUserId: targetUserId, toUserId: userId },
				],
			});

			if (!connectionAccepted) {
				return sendResponse(
					res,
					403,
					false,
					"You are not connected to this user",
				);
			}

			const messsagPopulate = {
				path: "messages.senderId",
				select: "firstName lastName",
			};
			/**
			 *Currently there are only 2 participants using $ne: userId  makes this query scalable comapred to  _id:targetUserId where it is only one value, if in a group chat using $ne will get all participants other than loggedInUser
			 */
			const participantsPopulate = {
				path: "participants",
				match: { _id: { $ne: userId } }, //return details of participants other than loggedInUser
				select: "firstName lastName profileImageMeta",
			};
			let chat = await ChatModel.findOne({
				participants: { $all: [userId, targetUserId].sort() },
			})
				.populate(participantsPopulate)
				.populate(messsagPopulate);

			if (!chat) {
				chat = new ChatModel({
					participants: [userId, targetUserId].sort(),
					messages: [],
				});
				//Populate after save
				await chat.save().then((chat) => chat.populate(participantsPopulate));
			}
			return sendResponse(res, 200, true, "Your Chats", chat);
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				console.error("Error occurred: ", err.message);
				return sendResponse(res, 500, false, "Internal server error");
			}
			return sendResponse(res, 500, false, "Unexpected Error");
		}
	},
);
export default chatRouter;
