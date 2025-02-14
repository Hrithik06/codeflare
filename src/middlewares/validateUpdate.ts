import { Request, Response, NextFunction } from "express";
import { userZodSchema, emailZodSchema } from "../schemas/User.zod.js";
import { ZodError, z } from "zod";
import { sendResponse } from "../utils/responseHelper.js";
//making all fields of user schema as optional for patch/update request
const userUpdateZodSchema = userZodSchema.partial();

//making all fields apart from emailId of user schema as optional for patch/update request
const userUpdateWithEmailRequiredZodSchema = userUpdateZodSchema.extend({
  emailId: userZodSchema.shape.emailId, // Making emailId required again
});

const validateUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { userId } = req.params;
    //If userId is not present then make sure emailId is present in req.body
    userId
      ? userUpdateZodSchema.parse(req.body)
      : userUpdateWithEmailRequiredZodSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.log("Validation Error:", err.message);
      //Return a structured JSON response with an array of errors

      return sendResponse(
        res,
        400,
        false,
        "Validation Failed",
        null,
        err.errors.map((e) => ({
          field: e.path.join("."), // Converts ["firstName"] to "firstName"
          message: e.message,
        }))
      );
    }
    //Error other than zod errors send it to express route to handle
    console.error("Unexpected Error:", err);
    next(err);
  }
};
export default validateUpdate;
