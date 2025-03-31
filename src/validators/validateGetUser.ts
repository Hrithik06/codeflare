import { Request, Response, NextFunction } from "express";
import { emailIdZodSchema } from "../schemas/User.zod.js";
import { ZodError } from "zod";

import { sendResponse } from "../utils/responseHelper.js";
const validateGetUserEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userEmailId: string = req.body.emailId;
    //Before parsing check email id is present or not
    if (!userEmailId) {
      return sendResponse(res, 400, false, "Email Id is required");
    }

    const validatedEmailId = emailIdZodSchema.parse(userEmailId);
    req.validatedData = { emailId: validatedEmailId };
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation Error:", err.errors);
      console.log(err.message);
      return sendResponse(
        res,
        400,
        false,
        "Validation Failed",
        null,
        err.errors.map((e) => ({
          field: e.path.length ? e.path.join(".") : "emailId", // Converts ["firstName"] to "firstName"
          message: e.message,
        }))
      );
    }
    //Error other than zod errors send it to express route to handle
    console.error("Unexpected Error:", err);
    return next(err);
  }
};
export default validateGetUserEmail;
