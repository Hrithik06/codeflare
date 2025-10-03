import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { config } from "./config/config.js";
import { connectDB } from "./config/databaseConnection.js";

import profileRouter from "./routes/profile.js";
import authRouter from "./routes/auth.js";
import requestRouter from "./routes/request.js";
import userRouter from "./routes/user.js";
import contactRouter from "./routes/contactUs.js";
import { sendTransactionalEmail } from "./utils/emailBuilder.js";
import "./utils/cronjob.js";
const app = express();
sendTransactionalEmail(
  "awspracticemon@gmail.com",
  "Pending Connection Request",
  "You have a pending connection request please login to gittogether.xyz to accept or reject the request.",
  "John"
);
const corsOptions = {
  origin: config.ORIGIN,
  credentials: true,
};
//middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/", profileRouter);
app.use("/", authRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", contactRouter);

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

// TODO: Create a custom error object, to handle errors
