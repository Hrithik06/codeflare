import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";

export const intiialiseSocket = (server: HttpServer) => {
	const io = new IOServer(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});
	io.on("connection", (socket) => {
		socket.on("joinChat", () => {});
		socket.on("sendMessage", () => {});
		socket.on("disconnect", () => {});
	});
};
