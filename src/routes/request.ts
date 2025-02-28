import express, { Request, Response } from "express";
import userAuth from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import { validateConnectionRequest } from "../validators/index.js";
import { sendResponse } from "../utils/responseHelper.js";
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  validateConnectionRequest,
  async (req: Request, res: Response) => {
    try {
      const fromUserId = req.user._id;
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
        if (existingConnection.status === status) {
          return sendResponse(
            res,
            400,
            false,
            `Existing request between ${req.user.firstName} and ${
              toUserExists.firstName
            } with status: ${existingConnection.status.toUpperCase()}`,
            existingConnection
          );
        }
        //TODO: Better handling of status change
        // const changeConnectionStatus = await ConnectionRequest.findOneAndUpdate(
        //   {
        //     $or: [
        //       { fromUserId, toUserId },
        //       { fromUserId: toUserId, toUserId: fromUserId },
        //     ],
        //   },
        //   { status },
        //   { new: true }
        // );
        // if (changeConnectionStatus) {
        //   return sendResponse(
        //     res,
        //     200,
        //     true,
        //     `Existing request between ${req.user.firstName} and ${
        //       toUserExists.firstName
        //     } with updated status: ${status.toUpperCase()}`,
        //     changeConnectionStatus
        //   );
        // }
      }
      //Create a new connection request in DB
      const newConnectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      await newConnectionRequest.save();

      res.send(newConnectionRequest);
    } catch (err) {
      if (err instanceof Error) {
        console.log("Error occurred:", err.message);
        return sendResponse(res, 400, false, `ERROR: ${err.message}`);
      }
      return sendResponse(res, 500, false, "Unexpected Error");
    }
  }
);

requestRouter.post(
  "/request/send/ignored/:userId",
  userAuth,
  async (req: Request, res: Response) => {}
);
requestRouter.post(
  "/request/review/acccepted/:requestId",
  userAuth,
  async (req: Request, res: Response) => {}
);
requestRouter.post(
  "/request/review/rejected/:requestId",
  userAuth,
  async (req: Request, res: Response) => {}
);
export default requestRouter;
