import { Request, Response, NextFunction } from "express";
import { userZodSchema } from "../schemas/User.zod.js";
import { ZodError } from "zod";

export const validateSignUp = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    userZodSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation Error:", err.errors);

      //Return a structured JSON response with an array of errors
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path.join("."), // Converts ["firstName"] to "firstName"
          message: e.message,
        })),
      });
      // return;
    }
    //Error other than zod errors send it to express route to handle
    console.error("Unexpected Error:", err);
    next(err);
  }
};
