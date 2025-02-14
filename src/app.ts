import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/database.js";
const app = express();
import User from "./models/user.js";
import {
  validateSignUp,
  validateGetUserEmail,
  validateUpdate,
  validateID,
} from "./middlewares/index.js";
import { sendResponse } from "./utils/responseHelper.js";
app.use(express.json());

//create a new user
app.post("/signup", validateSignUp, async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();

    sendResponse(res, 201, true, "User created successfully", user);
  } catch (err: any) {
    console.error("Error creating new user:", err.message);

    //MongoDB error if email already exists
    if (err.code === 11000) {
      sendResponse(res, 409, false, "Email already exists", null, [
        {
          field: "email",
          message: "Email already exists",
        },
      ]);
      return; //early return so express doesn't send the next error response
    }
    //Any other errors
    //Also includes error sent by validation middleware if it encounters error other than of zod
    sendResponse(res, 500, false, "Something went wrong", null, [
      { field: "server", message: err.message },
    ]);
  }
});

//Get user details by id
app.get("/user/:userId", validateID, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userResponse = await User.findById(userId);
    //If user not found mongoose returns null send error 404
    if (!userResponse) {
      sendResponse(res, 404, false, "User not found");
      return;
    }
    //send user details
    sendResponse(res, 200, true, "User retrieved successfully", userResponse);
  } catch (err: any) {
    if (err.name === "CastError") {
      return sendResponse(res, 400, false, "Invalid user ID format", null, [
        {
          field: "id",
          message: err.message,
        },
      ]);
    }
    // console.error("Error fetching user:", err.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
});

//Search for users using email
app.post(
  "/user/search",
  validateGetUserEmail,
  async (req: Request, res: Response) => {
    try {
      const userEmailId: string = req.body.emailId;

      const userResponse = await User.findOne({ emailId: userEmailId });
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
      console.error("Error fetching user:", err.message, err.code);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);

//get all users
app.get("/feed", async (req: Request, res: Response) => {
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
    console.error("Error fetching user:", err.code);
    return sendResponse(res, 500, false, "Internal server error");
  }
});

// delete a user
app.delete("/user/:userId", validateID, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const deleteResponse = await User.findByIdAndDelete(userId);
    //If user not found mongoose returns null send error 404
    if (!deleteResponse) {
      sendResponse(res, 404, false, "User not found");
      return;
    }
    //send user details
    sendResponse(res, 200, true, "User deleted successfully", deleteResponse);
  } catch (err: any) {
    if (err.name === "CastError") {
      return sendResponse(res, 400, false, "Invalid user ID format", null, [
        {
          field: "id",
          message: err.message,
        },
      ]);
    }
    // console.error("Error fetching user:", err.message);
    return sendResponse(res, 500, false, "Internal server error");
  }
});

app.patch(
  "/user/:userId",
  validateID,
  validateUpdate,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const updateResponse = await User.findByIdAndUpdate(userId, updateData, {
        returnDocument: "after",
      });
      //if _id is not found in DB mongoose returns null
      if (!updateResponse) {
        sendResponse(res, 404, false, "User not found");
        return;
      }
      sendResponse(res, 200, true, "User data updated", updateResponse);
    } catch (err: any) {
      console.error("Update ERROR :", err);
      return sendResponse(res, 500, false, "Internal server error");
    }
  }
);
connectDB()
  .then(() => {
    console.log("DB Connection successfull ");

    app.listen(7777, () => {
      console.log("Server successfully listening on port 7777");
    });
  })
  .catch((err: any) => {
    //TODO: Define Error Object. NEVER use any
    console.error("Database connection failed :: " + err.message);
  });
