import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import ChatModel from "../models/chat.js";
import crypto from "crypto";
import { joinChatSchema } from "../schemas/JoinChat.zod.js";
import { sendMessageSchema } from "../schemas/SendMessage.zod.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
const getSecreteRoomId = (senderUserId: string, targetUserId: string) => {
	return crypto
		.createHash("SHA256")
		.update([senderUserId, targetUserId].sort().join("_"))
		.digest("hex");
};
type AckResponse = { ok: true } | { ok: false; code: string };

export const intiialiseSocket = (server: HttpServer) => {
	const io = new IOServer(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});
	io.on("connection", (socket) => {
		socket.on("joinChat", (payload) => {
			try {
				const parsed = joinChatSchema.safeParse(payload);

				if (!parsed.success) {
					socket.emit("err", { reason: "INVALID_JOIN_CHAT_PAYLOAD" });
					return;
				}
				const { firstName, lastName, senderUserId, targetUserId } = parsed.data;

				const roomId = getSecreteRoomId(
					senderUserId.trim(),
					targetUserId.trim(),
				);
				socket.join(roomId);
				console.log(
					firstName.trim() + " " + lastName.trim() + " joined : " + roomId,
				);
			} catch (err) {
				console.log(err);
			}
		});
		//when client emits "sendMessage" it needs to be sent to the room
		socket.on("sendMessage", async (payload) => {
			try {
				const parsed = sendMessageSchema.safeParse(payload);
				if (!parsed.data) {
					return;
				}
				const { firstName, lastName, senderUserId, targetUserId, text } =
					parsed.data;

				//Check if both users are connected and status is accepted then only let them to chat
				const connectionAccepted = await ConnectionRequestModel.findOne({
					status: "accepted",
					$or: [
						{ fromUserId: senderUserId, toUserId: targetUserId },
						{ fromUserId: targetUserId, toUserId: senderUserId },
					],
				});

				if (!connectionAccepted) {
					return;
				}
				const roomId = getSecreteRoomId(senderUserId, targetUserId);

				/**
				 * DB call 2 Cases
				 * 1. This is the first message being sent i.e, no existing chat
				 * 2. There is already a existing chat current message needs to be appended to it.
				 */
				let chat = await ChatModel.findOne({
					participants: {
						$all: [senderUserId, targetUserId],
					},
				});
				if (!chat) {
					chat = new ChatModel({
						participants: [senderUserId, targetUserId],
					});
				}
				chat.messages.push({
					senderId: senderUserId,
					text,
				});
				await chat.save();
				// console.log(
				// 	firstName.trim() +
				// 		" " +
				// 		lastName.trim() +
				// 		" sent message to room : " +
				// 		roomId,
				// );
				io.to(roomId).emit("messageReceived", {
					senderUserId,
					firstName,
					lastName,
					text,
				});
			} catch (err) {
				//Graceful handling of error
				console.log(err);
			}
		});
		socket.on("disconnect", () => {});
	});
};
