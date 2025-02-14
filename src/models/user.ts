import { Schema, model, Document } from "mongoose";
import { z } from "zod";
import { userZodSchema } from "../schemas/User.zod.js";
export type UserType = z.infer<typeof userZodSchema> & Document; //Typescript Type
const userSchema = new Schema<UserType>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, lowercase: true },
});

const UserModel = model<UserType>("User", userSchema);
export default UserModel;
