import express, { NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { ObjectId } from "mongoose";
import { connectDB } from "./config/database.js";
const app = express();
import User from "./models/user.js";
import {
  validateSignUp,
  validateGetUserEmail,
  validateUpdate,
  validatePathId,
  validateLogin,
  userAuth,
} from "./middlewares/index.js";
import { sendResponse } from "./utils/responseHelper.js";

//middlewares
app.use(express.json());
app.use(cookieParser());

//create a new user
app.post("/signup", validateSignUp, async (req: Request, res: Response) => {
  try {
    const validatedData = req?.validatedData;
    const plainPassword = validatedData?.password;
    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const newUser = new User({ ...validatedData, password: passwordHash });
    await newUser.save();

    //remove password field when returning data
    const { password: _, ...userData } = newUser.toObject();

    sendResponse(res, 201, true, "User created successfully", userData);
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
      { field: "SignupError", message: err.message },
    ]);
  }
});

// Login
app.post("/login", validateLogin, async (req: Request, res: Response) => {
  //reset jwt cookie
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  });
  try {
    const { emailId, password: plainPassword } = req?.validatedData;
    //only fetch "password" and "_id" field from document
    const foundUser = await User.findOne({ emailId: emailId }).select([
      "_id",
      "password",
    ]);
    if (!foundUser) {
      return sendResponse(res, 404, false, "User not found");
    }

    // match user password with encrypted password in DB
    const isPasswordMatch = await foundUser.matchPassword(plainPassword);

    if (!isPasswordMatch) {
      return sendResponse(
        res,
        401,
        false,
        "Authentication failed due to incorrect credentials."
      );
    }
    const token = foundUser.getJWT();

    //TODO: implement refresh tokens
    //set cookie with 1 day(s) expiry
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
    });

    sendResponse(res, 200, true, "User logged in successfully");
  } catch (err: any) {
    console.error("Login ERROR :", err);
    return sendResponse(res, 500, false, "Internal server error ", null, [
      { field: "LoginError", message: err.message },
    ]);
  }
});

// TODO:More robust clearing cookies on client and server side
app.get("/logout", (req: Request, res: Response) => {
  // set expires to epoch so browser clears cookie
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  });
  res.status(200).send("Logged out successfully");
});

app.get("/profile", userAuth, async (req: Request, res: Response) => {
  try {
    const user = req?.user;
    sendResponse(res, 200, true, "Profile Data", user);
  } catch (err: any) {
    console.error("Profile ERROR :", err);
    return sendResponse(res, 500, false, "Internal server error ", null, [
      { field: "ProfileError", message: err.message },
    ]);
  }
});
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
  validateUpdate,
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
  validateUpdate,
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

    app.listen(7777, () => {
      console.log("Server successfully listening on port 7777");
    });
  })
  .catch((err: any) => {
    //TODO: Define Error Object. NEVER use any
    console.error("Database connection failed :: " + err.message);
  });
