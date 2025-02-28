import express, { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../models/user.js";
import { validateSignUp, validateLogin } from "../validators/index.js";
import { sendResponse } from "../utils/responseHelper.js";
const authRouter = express.Router();

//create a new user
authRouter.post(
  "/signup",
  validateSignUp,
  async (req: Request, res: Response) => {
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
      if (err instanceof Error) {
        sendResponse(res, 500, false, "Something went wrong", null, [
          { field: "SignupError", message: err.message },
        ]);
      } else {
        return sendResponse(res, 500, false, "An unknown error occurred");
      }
    }
  }
);

// Login
authRouter.post(
  "/login",
  validateLogin,
  async (req: Request, res: Response) => {
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
    } catch (err) {
      if (err instanceof Error) {
        return sendResponse(res, 500, false, "Internal server error ", null, [
          { field: "LoginError", message: err.message },
        ]);
      } else {
        return sendResponse(res, 500, false, "An unknown error occurred");
      }
    }
  }
);

// TODO:More robust clearing cookies on client and server side
authRouter.get("/logout", (req: Request, res: Response) => {
  // set expires to epoch so browser clears cookie
  res.cookie("token", null, {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  });

  return sendResponse(res, 200, true, "Logged out successfully");
  // res.status(200).send("Logged out successfully");
});

export default authRouter;
