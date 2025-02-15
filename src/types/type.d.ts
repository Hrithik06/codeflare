import { Request } from "express";
import { userZodSchema } from "../schemas/User.zod.js";

const validatedDataType = userZodSchema.partial();
export type ValidatedType = z.infer<typeof validatedDataType> & Document; //Typescript Type

declare global {
  namespace Express {
    interface Request {
      validatedData?: ValidatedType; // You can replace 'any' with a more specific type
    }
  }
}
