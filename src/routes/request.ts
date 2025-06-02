import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import {
  validateConnectionRequest,
  validateReviewRequest,
} from "../validators/index.js";
import { sendResponse } from "../utils/responseHelper.js";

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  validateConnectionRequest,
  async (req: Request, res: Response) => {
    try {
      const loggedInUser = req.user;
      const fromUserId = String(loggedInUser._id); //comes from loggedInUser
      const { toUserId, status } = req.params;

      //First check whether toUser exists or not?
      const toUserExists = await User.findById(toUserId);
      if (!toUserExists) {
        return sendResponse(
          res,
          400,
          false,
          "You tried connecting with a invalid user",
          null,
          [{ field: "toUserId", message: "User not Found" }]
        );
      }

      //using or condition to check if there is already request between users userA->userB or userB->userA
      const existingConnection = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnection) {
        //Construct message according the fromUserId and toUserId
        const message = existingConnection.fromUserId.equals(
          fromUserId.toString()
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
            `${toUserExists.firstName} is already in your connection`
          );
        }
        //FIXME:Better handling of requests which have been rejected.
        //This should not happen as in the feed we do not show profile once it is rejected by either of the user.
        return sendResponse(res, 409, false, `Connection rejected`);
        // Not changing status once ignored
        //CASE: What if userA sends userB "ignored", but userB sends userA "interested"
      }

      //Create a new connection request in DB
      const newConnectionRequest = new ConnectionRequest({
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
        return sendResponse(res, 400, false, `ERROR: ${err.message}`);
      }
      return sendResponse(res, 500, false, "Unexpected Error");
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  validateReviewRequest, //zod handles allowed values and requestId
  async (req: Request, res: Response) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const existingConnection = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
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
          existingConnection
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error occurred: ", err.message);
        return sendResponse(res, 400, false, `ERROR: ${err.message}`);
      }
      return sendResponse(res, 500, false, "Unexpected Error");
    }
  }
);

export default requestRouter;
