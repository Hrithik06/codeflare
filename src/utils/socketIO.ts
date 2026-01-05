import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import ChatModel from "../models/chat.js";
import crypto from "crypto";
import { joinChatSchema } from "../schemas/JoinChat.zod.js";
import { sendMessageSchema } from "../schemas/SendMessage.zod.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { config } from "../config/config.js";
import UserModel from "../models/user.js";

const getSecreteRoomId = (senderUserId: string, targetUserId: string) => {
	return crypto
		.createHash("SHA256")
		.update([senderUserId, targetUserId].sort().join("_"))
		.digest("hex");
};

const decodeJWTId = (rawCookie: string): string => {
	const token = rawCookie.split("=")[1];
	const JWT_SECRET_KEY: Secret = config.JWT_SECRET_KEY;
	const decodedData = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
	return decodedData._id;
};

export const intiialiseSocket = (server: HttpServer) => {
	const io = new IOServer(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});
	io.on("connection", async (socket) => {
		//PHASE 1: Authenticate & initialize context
		io.use(async (socket, next) => {
			try {
				const rawCookie = socket.handshake.headers.cookie;
				if (!rawCookie?.startsWith("token")) {
					return next(new Error("UNAUTHORIZED"));
				}

				const userId = decodeJWTId(rawCookie);
				const user = await UserModel.findById(userId).select(
					"_id firstName lastName",
				);

				if (!user) {
					return next(new Error("USER_NOT_FOUND"));
				}

				socket.data.user = {
					_id: user._id.toString(),
					firstName: user.firstName,
					lastName: user.lastName,
				};

				next(); //connection allowed
			} catch {
				next(new Error("INVALID_SESSION"));
			}
		});

		//TODO: Authenticateed user only allowed to middle for auth like userAuth for APIs
		socket.on("joinChat", async (payload) => {
			try {
				const parsed = joinChatSchema.safeParse(payload);
				const { _id } = socket.data.user;
				if (!parsed.success) {
					socket.emit("err", { reason: "INVALID_JOIN_CHAT_PAYLOAD" });
					//Write better reason
					// socket.emit("err", { reason: "INVALID_targetUserId" });
					return;
				}
				const { targetUserId } = parsed.data;
				const senderUserId = _id;

				if (senderUserId === targetUserId) {
					socket.emit("err", { reason: "Cannot join chat with yourself" });
					return;
				}

				const isConnected = await ConnectionRequestModel.exists({
					status: "accepted",
					$or: [
						{ fromUserId: senderUserId, toUserId: targetUserId },
						{ fromUserId: targetUserId, toUserId: senderUserId },
					],
				});

				if (!isConnected) {
					socket.emit("err", { reason: "NOT_CONNECTED" });
					return;
				}

				const roomId = getSecreteRoomId(senderUserId, targetUserId.trim());
				socket.join(roomId);
			} catch (err) {
				console.log(err);
				socket.emit("err", { reason: "Internal Server Error" });
			}
		});
		//when client emits "sendMessage" it needs to be sent to the room
		socket.on("sendMessage", async (payload) => {
			try {
				const parsed = sendMessageSchema.safeParse(payload);
				if (!parsed.success) {
					socket.emit("err", { reason: "INVALID_SEND_MESSAGE_PAYLOAD" });
					return;
				}
				const { _id, firstName, lastName } = socket.data.user;

				const { targetUserId, text } = parsed.data;
				const senderUserId = _id;

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

				io.to(roomId).emit("messageReceived", {
					senderUserId,
					firstName,
					lastName,
					text,
				});
			} catch (err) {
				//Graceful handling of error
				console.log(err);
				socket.emit("err", { reason: "Internal Server Error" });
			}
		});
		socket.on("disconnect", () => {
			console.log("disconnected");
		});
	});
};
