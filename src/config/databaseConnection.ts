import mongoose from "mongoose";
import { config } from "../config/config.js";
export const connectDB = async () => {
  await mongoose.connect(
    `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@cluster0codeflare.vp3x4.mongodb.net/codeFlareDB`
  );
};
