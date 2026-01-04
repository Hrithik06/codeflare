import express, { Request, Response } from "express";
import validatePathId from "../validators/validatePathId.js";
import userAuth from "../middlewares/userAuth.js";
import { objectIdSchema } from "../schemas/ObjectId.zod.js";
import ChatModel from "../models/chat.js";
import { sendResponse } from "../utils/responseHelper.js";
import ConnectionRequestModel from "../models/connectionRequest.js";

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
			let chat = await ChatModel.findOne({
				participants: { $all: [userId, targetUserId] },
			}).populate({
				path: "messages.senderId",
				select: "firstName lastName",
			});
			if (!chat) {
				chat = new ChatModel({
					participants: [userId, targetUserId],
					messages: [],
				});
			}
			await chat.save();
			return sendResponse(res, 200, true, "Your Chats", chat.messages);
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
