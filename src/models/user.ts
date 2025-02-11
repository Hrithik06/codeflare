import { Schema, model, Document } from "mongoose";
import { z } from "zod";
import { userZodSchema } from "../schemas/User.zod.js";
type UserType = z.infer<typeof userZodSchema> & Document; //Typescript Type
const userSchema = new Schema<UserType>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
});

const UserModel = model<UserType>("User", userSchema);
export default UserModel;
