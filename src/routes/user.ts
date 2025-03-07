import express, { Request, Response, NextFunction } from "express";
import userAuth from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import { sendResponse } from "../utils/responseHelper.js";

const userRouter = express.Router();
const SAFE_USER_DATA = [
  "firstName",
  "lastName",
  "gender",
  "age",
  "about",
  "skills",
];
userRouter.get(
  "/user/requests/recieved",
  userAuth,
  async (req: Request, res: Response) => {
    const loggedInUser = req.user;

    // if there are requests where loggedInUser is toUser and status is accepted
    const requestList = await ConnectionRequest.find({
      status: "interested",
      toUserId: loggedInUser._id,
    })
      .populate("fromUserId", SAFE_USER_DATA)
      .select("fromUserId -_id");
    const data = requestList.map((row) => row.fromUserId);
    data.length === 0
      ? sendResponse(res, 200, true, "No requests for you", [])
      : sendResponse(res, 200, true, "Your requests are", data);
  }
);

userRouter.get(
  "/user/connections",
  userAuth,
  async (req: Request, res: Response) => {
    const loggedInUser = req.user;
    //if the status is accepted and loggedInUser is present as fromUser or toUser, then there is a connection present
    const connectionList = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    })
      .populate("fromUserId", SAFE_USER_DATA)
      .populate("toUserId", SAFE_USER_DATA);

    //FIXME:Elena's profile is being returned as a connection to Elena not Nathan, because Elena sent the request, fromUserId is Elena's //[x]FIXED
    const data = connectionList.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id as string)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    data.length === 0
      ? sendResponse(res, 200, true, "No connections for you", [])
      : sendResponse(res, 200, true, "Your connections are", data);
  }
);

export default userRouter;
