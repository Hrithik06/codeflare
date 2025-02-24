import { Request, Response, NextFunction } from "express";
import { userZodSchema } from "../schemas/User.zod.js";
import { ZodError } from "zod";
import { sendResponse } from "../utils/responseHelper.js";
//making all fields of user schema as optional for patch/update request
const userUpdateZodSchema = userZodSchema.partial();



const validateProfileEdit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {

    const validatedData = userUpdateZodSchema.parse(req.body)
    req.validatedData = validatedData;

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
export default validateProfileEdit;
