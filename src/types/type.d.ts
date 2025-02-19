import { Request } from "express";
import { userZodSchema } from "../schemas/User.zod.js";
import { UserType } from "../models/user.ts";

export type ValidatedType = z.infer<typeof UserType> & Document; //Typescript Type when data is coming from user for POST/signup PATCH/update

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedType;
      user?: UserType; // attaching data after login
    }
  }
}
