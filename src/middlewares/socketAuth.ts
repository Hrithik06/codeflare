import { Server as IOServer } from "socket.io";
import UserModel from "../models/user.js";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { config } from "../config/config.js";
const decodeJWTId = (rawCookie: string): string => {
	const token = rawCookie.split("=")[1];
	const JWT_SECRET_KEY: Secret = config.JWT_SECRET_KEY;
	const decodedData = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
	return decodedData._id;
};
const socketAuth = (io: IOServer) => {
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
};

export default socketAuth;
