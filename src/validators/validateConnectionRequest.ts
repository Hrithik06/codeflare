import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { connectionRequestZodSchema } from "../schemas/ConnectionRequest.zod.js";
import { sendResponse } from "../utils/responseHelper.js";
import { ZodError } from "zod";
const validateConnectionRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { toUserId, status } = req.params;
  const { _id } = req.user;
  const fromUserId = String(_id);

  try {
    // Checking only for toUserId as fromUserId of loggedInUser's so need to again validate
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return sendResponse(res, 400, false, "Invalid user ID format", null, [
        {
          field: "id",
          message: "The provided toUserId is not a valid MongoDB ObjectId.",
        },
      ]);
    }

    connectionRequestZodSchema.parse({ fromUserId, toUserId, status });

    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return sendResponse(
        res,
        400,
        false,
        "Validation Error",
        null,
        err.errors.map((e) => ({
          field: e.path.join("."), // Converts ["firstName"] to "firstName"
          message: e.message,
        }))
      );
    }

    console.error("Unexpected Error:", err);
    return next(err);
  }
};
export default validateConnectionRequest;
