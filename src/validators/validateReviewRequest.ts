import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { sendResponse } from "../utils/responseHelper.js";
import { reviewRequestZodSchema } from "../schemas/ReviewRequest.zod.js";
import { ZodError } from "zod";
const validateReviewRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, requestId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return sendResponse(res, 400, false, "Invalid requestId format", null, [
        {
          field: "requestId",
          message: "The provided requestId is not a valid MongoDB ObjectId.",
        },
      ]);
    }
    reviewRequestZodSchema.parse({ requestId, status });
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

export default validateReviewRequest;
