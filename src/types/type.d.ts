import { Request } from "express";
import { userZodSchema } from "../schemas/User.zod.ts";
import { UserInterface } from "./dbInterfaces.ts";

export type ValidatedType = z.infer<typeof UserInterface> & Document; //Typescript Type when data is coming from user for POST/signup PATCH/update

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedType;
      user: UserInterface & Document; // attaching data after login
    }
  }
}
