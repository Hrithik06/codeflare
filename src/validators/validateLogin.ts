import { Request, Response, NextFunction } from "express";
import { passwordZodSchema, emailZodSchema } from "../schemas/User.zod.js";
import { ZodError, z } from "zod";
import { sendResponse } from "../utils/responseHelper.js";

const loginZodSchema = z.object({
  emailId: emailZodSchema,
  password: passwordZodSchema,
});
const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const validatedData = loginZodSchema.parse(req?.body);
    req.validatedData = validatedData;

    return next();
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
    return next(err);
  }
};
export default validateLogin;
