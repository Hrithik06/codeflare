import express, { NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { ObjectId } from "mongoose";

import { config } from "./config/config.js";
import { connectDB } from "./config/databaseConnection.js";
import User from "./models/user.js";
import {
  validateGetUserEmail,
  validateProfileEdit,
  validatePathId,
} from "./validators/index.js";
import userAuth from "./middlewares/userAuth.js";
import profileRouter from "./routes/profile.js";
import authRouter from "./routes/auth.js";
import requestRouter from "./routes/request.js";

import { sendResponse } from "./utils/responseHelper.js";

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());

app.use("/", profileRouter);
app.use("/", authRouter);
app.use("/", requestRouter);

//Get user details by id
app.get(
  "/user/:userId",
  userAuth,
  validatePathId,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params?.userId;

      const foundUser = await User.findById(userId).select([
        "-password",
        "-createdAt",
        "-updatedAt",
        "-__v",
      ]);
      //If user not found mongoose returns null send error 404
      if (!foundUser) {
        sendResponse(res, 404, false, "User not found");
        return;
      }
      //send user details
      sendResponse(res, 200, true, "User retrieved successfully", foundUser);
    } catch (err: any) {
      if (err.name === "CastError") {
        return sendResponse(res, 400, false, "Invalid user ID format", null, [
          {
            field: "userId",
            message: err.message,
          },
        ]);
      }
      // console.error("Error fetching user:", err.message);
      return sendResponse(res, 500, false, "Internal server error", null, [
        { field: "GetIDError", message: err.message },
      ]);
    }
  }
);

//Search for users using email
app.post(
  "/user/search",
  userAuth,
  validateGetUserEmail,
  async (req: Request, res: Response) => {
    try {
      const userEmailId: string = req?.validatedData?.emailId;

      const userResponse = await User.findOne({ emailId: userEmailId }).select([
        "-password",
        "-createdAt",
        "-updatedAt",
        "-__v",
      ]);
      //If user not found mongoose returns null send error 404
      if (!userResponse) {
        sendResponse(res, 404, false, "User not found");
        return;
      }
      //send user details
      sendResponse(
        res,
        200,
        true,
        `User(s) retrieved successfully`,
        userResponse
      );
    } catch (err: any) {
      // console.error("Error fetching user:", err.message, err.code);
      return sendResponse(res, 500, false, "Internal server error", null, [
        { field: "GetEmailError", message: err.message },
      ]);
    }
  }
);

//get all users
app.get("/feed", userAuth, async (req: Request, res: Response) => {
  try {
    const feedResponse = await User.find({});
    // console.log(feedResponse);

    //If no users, feedResponse length is 0
    if (feedResponse.length === 0) {
      sendResponse(res, 200, true, "No user(s) found", [], []);
      return;
    }
    //send user details
    sendResponse(
      res,
      200,
      true,
      "User(s) retrieved successfully",
      feedResponse
    );
  } catch (err: any) {
    console.error("Error fetching feed:", err);
    return sendResponse(res, 500, false, "Internal server error", null, [
      { field: "FeedError", message: err.message },
    ]);
  }
});

// delete a user
app.delete(
  "/user/:userId",
  userAuth,
  validatePathId,
  async (req: Request, res: Response) => {
    try {
      //userId from path
      const userId: string = req.params?.userId;

      //Logged in user _id
      const _id: ObjectId = req?.user?._id as ObjectId;

      // make sure loggedIn user's _id is same as userId in path
      if (userId === _id.toString()) {
        const deleteResponse = await User.findByIdAndDelete(userId);

        //If user not found mongoose returns null send error 404
        if (!deleteResponse) {
          sendResponse(res, 404, false, "User not found");
          return;
        }
        // send user details
        sendResponse(
          res,
          200,
          true,
          "User deleted successfully",
          deleteResponse
        );
        return;
      }
      // if loggedIn user's _id and path userId doesn't match send error
      sendResponse(res, 401, false, "Unauthorised Request");
    } catch (err: any) {
      if (err.name === "CastError") {
        return sendResponse(res, 400, false, "Invalid user ID format", null, [
          {
            field: "userId",
            message: err.message,
          },
        ]);
      }
      // console.error("Error fetching user:", err.message);
      return sendResponse(res, 500, false, "Internal server error", null, [
        {
          field: "DeleteError",
          message: err.message,
        },
      ]);
    }
  }
);

//update user using id in path
app.patch(
  "/user/:userId",
  userAuth,
  validatePathId,
  validateProfileEdit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //userId from path
      const userId: string = req.params?.userId;

      //Logged in user _id
      const _id: ObjectId = req?.user?._id as ObjectId;
      // make sure loggedIn user's _id is same as userId in path
      if (userId === _id.toString()) {
        const updateData = req?.validatedData;

        const updateResponse = await User.findByIdAndUpdate(
          userId,
          updateData,
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

        //if _id is not found in DB mongoose returns null
        if (!updateResponse) {
          sendResponse(res, 404, false, "User not found");
          return;
        }
        sendResponse(res, 200, true, "User data updated", updateResponse);
        return;
      }
      sendResponse(res, 401, false, "Unauthorised Request");
    } catch (err: any) {
      console.error("Update ERROR :", err.name);
      return sendResponse(res, 500, false, "Internal server error ", null, [
        { field: "UpdateIdError", message: err.message },
      ]);
    }
  }
);
// update user using email
app.patch(
  "/user",
  userAuth,
  validateProfileEdit,
  async (req: Request, res: Response) => {
    try {
      const { emailId } = req?.validatedData;
      const updateData = req?.validatedData;

      const updateResponse = await User.findOneAndUpdate(
        { emailId: emailId },
        updateData,
        {
          runValidators: true,
          returnDocument: "after",
        }
      );

      //if emailId is not found in DB mongoose returns null
      if (!updateResponse) {
        sendResponse(res, 404, false, "User not found");
        return;
      }
      sendResponse(res, 200, true, "User data updated", updateResponse);
    } catch (err: any) {
      console.error("Update ERROR :", err);
      return sendResponse(res, 500, false, "Internal server error ", null, [
        { field: "UpdateEmailError", message: err.message },
      ]);
    }
  }
);
// app.use("/", (req: Request, res: Response) => {
//   return sendResponse(res, 500, false, "Soemthing went wrong");
// });
connectDB()
  .then(() => {
    console.log("DB Connection successfull ");
    app.listen(config.PORT, () => {
      console.log(`Server successfully listening on port ${config.PORT}`);
    });
  })
  .catch((err) => {
    //TODO: Define Error Object. NEVER use any
    console.log(err);
    console.error("Database connection failed \nERROR:: " + err.message);
    process.exit(1);
  });
