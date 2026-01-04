import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import crypto from "crypto";
const getSecreteRoomId = (userId: string, targetUserId: string) => {
	return crypto
		.createHash("SHA256")
		.update([userId, targetUserId].sort().join("_"))
		.digest("hex");
};
export const intiialiseSocket = (server: HttpServer) => {
	const io = new IOServer(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});
	io.on("connection", (socket) => {
		socket.on("joinChat", ({ firstName, lastName, userId, targetUserId }) => {
			const roomId = getSecreteRoomId(userId.trim(), targetUserId.trim());
			socket.join(roomId);
			// console.log(
			// 	firstName.trim() + " " + lastName.trim() + " joined : " + roomId,
			// );
		});
		//when client emits "sendMessage" it needs to be sent to the room
		socket.on(
			"sendMessage",
			({ firstName, lastName, userId, targetUserId, text }) => {
				const roomId = getSecreteRoomId(userId, targetUserId);
				firstName = firstName.trim();
				text = text.trim();
				lastName = lastName.trim();

				console.log(
					firstName.trim() +
						" " +
						lastName.trim() +
						" sent message to room : " +
						roomId,
				);
				io.to(roomId).emit("messageReceived", {
					firstName,
					lastName,
					text,
				});
			},
		);
		socket.on("disconnect", () => {});
	});
};
