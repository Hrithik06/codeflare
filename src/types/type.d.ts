import { Request } from "express";
import { userZodSchema } from "../schemas/User.zod.ts";
import { UserInterface } from "./dbInterfaces.ts";
import mongoose from "mongoose";
export type ValidatedType = z.infer<typeof UserInterface> & mongoose.Document; //Typescript Type when data is coming from user for POST/signup PATCH/update

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedType;
      user: UserInterface & mongoose.Document; // attaching data after login
    }
  }
}
