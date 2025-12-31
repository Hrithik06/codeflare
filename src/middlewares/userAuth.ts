import { NextFunction, type Request, type Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { sendResponse } from "../utils/responseHelper.js";
import User from "../models/user.js";
import { config } from "../config/config.js";

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
	// if there are no cookies present
	try {
		if (!req.cookies || Object.keys(req.cookies).length === 0) {
			sendResponse(res, 401, false, "Unauthorized: Please Login");
			return;
		}
		//Read the token from cookies
		const { token } = req?.cookies;
		//Verify/Validate the token and get the decoded data
		//throws error if there is issue with JWT
		if (!token) {
			sendResponse(res, 401, false, "Unauthorized: Please Login");
			return;
		}
		const JWT_SECRET_KEY: Secret = config.JWT_SECRET_KEY;
		const decodedData = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
		//Find the user
		const foundUser = await User.findById(decodedData?._id).select([
			"-password",
			"-createdAt",
			// "-updatedAt",
			"-__v",
		]);

		if (!foundUser) {
			sendResponse(res, 404, false, "User not found");
			return;
		}
		req.user = foundUser;
		next();
	} catch (err: any) {
		console.error("Auth ERROR :", err);
		return sendResponse(res, 500, false, "Internal Server Error");
	}
};
export default userAuth;
