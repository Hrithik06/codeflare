import express, { Request, Response } from "express";
import mongoose from "mongoose";
import userAuth from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
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
    try {
      const loggedInUser = req.user;

      // if there are requests where loggedInUser is toUser and status is accepted
      const requestList = await ConnectionRequest.find({
        status: "interested",
        toUserId: loggedInUser._id,
      }).populate("fromUserId", SAFE_USER_DATA);

      const data = requestList.map((row) => {
        return {
          _id: row._id, //requestId
          fromUserId: row.fromUserId,
        };
      });
      data.length === 0
        ? sendResponse(res, 200, true, "No requests for you", [])
        : sendResponse(res, 200, true, "Your requests are", data);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error occurred: ", err.message);
        return sendResponse(res, 400, false, `ERROR: ${err.message}`);
      }
      return sendResponse(res, 500, false, "Unexpected Error");
    }
  }
);

userRouter.get(
  "/user/connections",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const loggedInUser = req.user;
      /**if the status is accepted and
       * loggedInUser is present as fromUser or toUser,
       * then there is a connection present
       */
      const connectionList = await ConnectionRequest.find({
        status: "accepted",
        $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
      })
        .populate("fromUserId", SAFE_USER_DATA)
        .populate("toUserId", SAFE_USER_DATA);

      /**
       //FIXME:Elena's profile is being returned as a connection to Elena not Nathan,
       * because Elena sent the request, fromUserId is Elena's 
       //[x]FIXED
      */
      const data = connectionList.map((row) => {
        if (
          row.fromUserId._id.equals(loggedInUser._id as mongoose.Types.ObjectId)
        ) {
          return row.toUserId;
        }
        return row.fromUserId;
      });

      data.length === 0
        ? sendResponse(res, 200, true, "No connections for you", [])
        : sendResponse(res, 200, true, "Your connections are", data);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error occurred: ", err.message);
        return sendResponse(res, 400, false, `ERROR: ${err.message}`);
      }
      return sendResponse(res, 500, false, "Unexpected Error");
    }
  }
);

/**
 CASE: In the feed need to show users who are not 
 1.Do not show user's own profile.
 2.Already in connection (accepted).
 3.User has has sent request ignored, interested.
 4.Rejected by user
 
 Example: Users: [Nathan, Elena, Victor, Sam, Alan, Alice]
 1. Nathan(Own Profile) 
 2. Nathan -> Elena (Elena `accepted`) or Elena -> Nathan(Nathan `accepted`)
 3a. Nathan -inteseted-> Victor or Victor -inteseted-> Nathan
 3b. Nathan -ignored-> Sam or Sam -ignored-> Nathan
 4. Nathan -> Alan (Alan `rejected`) or Alan -> Nathan(Nathan `rejected`)
 */

//My solution with array includes, filter and all
userRouter.get(
  "/user1/feed1",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const loggedInUser = req.user;
      let idsToRemove: Array<string>;
      //existingRequests contains requests/connections sent or received by loggedInUser(all 4 status)
      // Case 2,3,4 covered
      const existingRequests = await ConnectionRequest.find({
        $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
      }).select("fromUserId toUserId");
      idsToRemove = existingRequests.map((row) => {
        if (
          row.fromUserId._id.equals(loggedInUser._id as mongoose.Types.ObjectId)
        ) {
          return row.toUserId.toString();
        }
        return row.fromUserId.toString();
      });

      //Adding loggedInUser to remove in feed
      //Case 1 covered
      idsToRemove.push(loggedInUser._id as string);

      //Fetch all Users in DB
      const allUsers = await User.find({}).select(SAFE_USER_DATA);

      //Filter _ids who are not in requests/connections
      const filteredUsers = allUsers.filter(
        (value) => !idsToRemove.includes(value._id as string)
      );

      return sendResponse(res, 200, true, "Feed", filteredUsers);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error occurred: ", err.message);
        return sendResponse(res, 400, false, `ERROR: ${err.message}`);
      }
      return sendResponse(res, 500, false, "Unexpected Error");
    }
  }
);

//Akshay solution

userRouter.get("/user/feed", userAuth, async (req: Request, res: Response) => {
  try {
    const page: number = parseInt(req.query.page as string);
    let limit: number = parseInt(req.query.limit as string) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip: number = (page - 1) * limit || 0;

    const loggedInUser = req.user;
    const existingRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    //Creating a Set which contains all userIds to be hidden
    const hideUsers = new Set();
    existingRequests.forEach((value) => {
      hideUsers.add(value.fromUserId.toString());
      hideUsers.add(value.toUserId.toString());
    });

    const showUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsers) } },
        { _id: { $ne: loggedInUser._id } }, //Maybe unnescessary as hideUsers will have loggedInUser as it can be in (from/to)UserId
      ],
    })
      .select(SAFE_USER_DATA)
      .skip(skip)
      .limit(limit);

    return sendResponse(res, 200, true, "feed", showUsers);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error occurred: ", err.message);
      return sendResponse(res, 400, false, `ERROR: ${err.message}`);
    }
    return sendResponse(res, 500, false, "Unexpected Error");
  }
});
export default userRouter;
