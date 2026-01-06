import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import ChatModel from "../models/chat.js";
// import crypto from "crypto";
import { joinChatSchema } from "../schemas/JoinChat.zod.js";
import { sendMessageSchema } from "../schemas/SendMessage.zod.js";
import socketAuth from "../middlewares/socketAuth.js";
export type AppSocketError = {
	code: string; // stable, machine-readable
	message: string; // safe, user-facing default
	context?: string; // optional: joinChat, sendMessage, auth
	data?: Record<string, any>; // optional: field-level info
	retryable?: boolean; // UX hint
};
const emitError = (socket: Socket, error: AppSocketError) => {
	console.error("app_error", error);
	socket.emit("app_error", error);
};

// const getSecretRoomId = (senderUserId: string, targetUserId: string) => {
// 	return crypto
// 		.createHash("SHA256")
// 		.update([senderUserId, targetUserId].sort().join("_"))
// 		.digest("hex");
// };

export const intiialiseSocket = (server: HttpServer) => {
	const io = new IOServer(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});

	/**
	 * Middleware : Authenticate & initialize context
	 */
	socketAuth(io);

	io.on("connection", async (socket) => {
		socket.on("joinChat", async (payload) => {
			try {
				const parsed = joinChatSchema.safeParse(payload);
				const { _id: senderUserId } = socket.data.user;
				if (!parsed.success) {
					emitError(socket, {
						code: "VALIDATION_JOIN_CHAT_PAYLOAD",
						message: "Invalid chat request.",
						context: "joinChat",
						data: parsed.error.flatten(),
						retryable: false,
					});
					return;
				}

				const { chatId } = parsed.data;
				// if (senderUserId === targetUserId) {
				// 	emitError(socket, {
				// 		code: "VALIDATION_SELF_CHAT",
				// 		message: "You cannot start a chat with yourself.",
				// 		context: "joinChat",
				// 		retryable: false,
				// 	});
				// 	return;
				// }

				// const isConnected = await ConnectionRequestModel.exists({
				// 	status: "accepted",
				// 	$or: [
				// 		{ fromUserId: senderUserId, toUserId: targetUserId },
				// 		{ fromUserId: targetUserId, toUserId: senderUserId },
				// 	],
				// });

				// if (!isConnected) {
				// 	emitError(socket, {
				// 		code: "CHAT_NOT_CONNECTED",
				// 		message: "You can only chat with connected users.",
				// 		context: "joinChat",
				// 		retryable: false,
				// 	});
				// 	return;
				// }
				const isParticipant = await ChatModel.exists({
					_id: chatId,
					participants: senderUserId,
				});
				if (!isParticipant) {
					emitError(socket, {
						code: "INVALID_CHAT",
						message: "You are not part of this Chat",
						context: "joinChat",
						retryable: false,
					});
					return;
				}

				//Generate roomId
				// const roomId = getSecretRoomId(senderUserId, targetUserId);
				const roomId = chatId;
				//Join room
				socket.join(roomId);
			} catch (err) {
				console.error(err);
				emitError(socket, {
					code: "INTERNAL_ERROR",
					message: "Something went wrong while joining the chat.",
					context: "joinChat",
					retryable: true,
				});
				return;
			}
		});
		//when client emits "sendMessage" it needs to be sent to the room
		socket.on("sendMessage", async (payload) => {
			try {
				const parsed = sendMessageSchema.safeParse(payload);
				if (!parsed.success) {
					emitError(socket, {
						code: "VALIDATION_SEND_MESSAGE_PAYLOAD",
						message: "Invalid send message request.",
						context: "sendMessage",
						data: parsed.error.flatten(),
						retryable: false,
					});
					return;
				}
				const { _id: senderUserId, firstName, lastName } = socket.data.user;
				const { text, chatId } = parsed.data;
				const roomId = chatId;

				/**
				 *This single handedly checks if the sender is a participant of the chat if yes pushes the message no need of 2 DB calls for checking and psuhing message
				 */
				const result = await ChatModel.updateOne(
					{
						_id: chatId,
						participants: senderUserId,
						// status: "active", // optional in-future can be used
					},
					{
						$push: {
							messages: {
								senderId: senderUserId,
								text,
							},
						},
					},
				);

				if (result.modifiedCount === 0) {
					emitError(socket, {
						code: "CHAT_WRITE_FORBIDDEN",
						message: "You are not allowed to send messages in this chat.",
						context: "sendMessage",
						retryable: false,
					});
					return;
				}
				io.to(roomId).emit("messageReceived", {
					senderUserId,
					firstName,
					lastName,
					text,
				});
				/**
				 * Checks if user is participant of the chat or not
				 */
				// let isParticipant = await ChatModel.exists({
				// 	_id: chatId,
				// 	participants: senderUserId,
				// });
				// if (!isParticipant) {
				// 	emitError(socket, {
				// 		code: "INVALID_CHAT",
				// 		message: "You are not part of this Chat",
				// 		context: "joinChat",
				// 		retryable: false,
				// 	});
				// 	return;
				// }

				// const roomId = getSecretRoomId(senderUserId, targetUserId);
				/**
				 * find the chat and push message then save
				 */
				// let chat = await ChatModel.findById({
				// 	_id: chatId,
				// });
				// if (!chat) {
				// 	emitError(socket, {
				// 		code: "INTERNAL_ERROR",
				// 		message: "Failed to send message.",
				// 		context: "sendMessage",
				// 		retryable: true,
				// 	});
				// 	return;
				// }
				// chat?.messages.push({
				// 	senderId: senderUserId,
				// 	text: text,
				// });
				// await chat.save();
			} catch (err) {
				console.error(err);
				emitError(socket, {
					code: "INTERNAL_ERROR",
					message: "Failed to send message.",
					context: "sendMessage",
					retryable: true,
				});
				return;
			}

			/**
			 * I DONT THINK I NEED THIS cuz its being handled in api /chat/:targetUserId
			 * DB call 2 Cases
			 * 1. This is the first message being sent i.e, no existing chat
			 * 2. There is already a existing chat current message needs to be appended to it.
			 */
			// let chat = await ChatModel.findOne({
			// 	participants: {
			// 		$all: [senderUserId, targetUserId].sort(),
			// 	},
			// });
			// if (!chat) {
			// 	chat = new ChatModel({
			// 		participants: [senderUserId, targetUserId],
			// 	});
			// }
			// chat.messages.push({
			// 	senderId: senderUserId,
			// 	text,
			// });
			// await chat.save();
		});
		socket.on("disconnect", () => {
			console.log("socket connection disconnected");
		});
	});
};
