import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { sendResponse } from "../utils/responseHelper.js";
const validateID = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return sendResponse(res, 400, false, "Invalid user ID format", null, [
      {
        field: "id",
        message: "The provided ID is not a valid MongoDB ObjectId.",
      },
    ]);
  }
  next();
};
export default validateID;
