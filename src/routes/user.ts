import express, { Request, Response, NextFunction } from "express";
import userAuth from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import { sendResponse } from "../utils/responseHelper.js";

const userRouter = express.Router();

userRouter.get(
  "/user/connections",
  userAuth,
  async (req: Request, res: Response) => {
    const loggedInUser = req.user;
    //if the status is accepted and loggedInUser is present as fromUser or toUser, then there is a connection present
    const connectionList = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
      status: "accepted",
    });
    connectionList.length === 0
      ? sendResponse(res, 200, true, "No connections for you", [])
      : sendResponse(res, 200, true, "Your connections are", connectionList);
  }
);
userRouter.get(
  "/user/requests",
  userAuth,
  async (req: Request, res: Response) => {
    const loggedInUser = req.user;

    // if there are requests where loggedInUser is toUser and status is accepted
    const requestsList = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    });
    requestsList.length === 0
      ? sendResponse(res, 200, true, "No requests for you", [])
      : sendResponse(res, 200, true, "Your requests are", requestsList);
  }
);

export default userRouter;
