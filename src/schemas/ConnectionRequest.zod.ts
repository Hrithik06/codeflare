import { z } from "zod";
import mongoose from "mongoose";

export const connectionRequestZodSchema = z.object({
  // fromUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
  //   message: "Invalid fromUserId format",
  // }), // Validate ObjectId format
  // toUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
  //   message: "Invalid toUserId format",
  // }),
  fromUserId: z.string().refine(
    (val) => {
      return mongoose.Types.ObjectId.isValid(val);
    },
    { message: "Invalid fromUserId format" }
  ), // Validate ObjectId format
  toUserId: z.string().refine(
    (val) => {
      return mongoose.Types.ObjectId.isValid(val);
    },
    { message: "Invalid toUserId format" }
  ), // Validate ObjectId format
  status: z.enum(["interested", "ignored"]),
});
