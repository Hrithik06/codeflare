import express, { type Request, type Response } from "express";
import { connectDB } from "./config/database.js";
const app = express();
import User from "./models/user.js";
import { validateSignUp } from "./middlewares/validateSignUp.js";
import { sendResponse } from "./utils/responseHelper.js";

app.use(express.json());
app.post("/signup", validateSignUp, async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    console.log(user.email);

    sendResponse(res, 201, true, "User created successfully");
  } catch (err: any) {
    //MongoDB error if email already exists
    if (err.code === 11000) {
      return sendResponse(res, 409, false, "Email already exists", null, [
        {
          field: "email",
          message: "Email already exists",
        },
      ]);
      return;
    }
    //Any other errors
    //Also includes error sent by validation middleware if it encounters error other than of zod
    sendResponse(res, 500, false, "Something went wrong", null, [
      { field: "server", message: err.message },
    ]);
  }
});

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
