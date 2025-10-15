import mongoose from "mongoose";
import { config } from "./config.js";
export const connectDB = async () => {
  await mongoose.connect(
    `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}${config.DB_CLUSTER}`
  );
};
