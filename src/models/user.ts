import { Schema, model } from "mongoose";
import { UserInterface } from "../types/dbInterfaces.js";
const userSchema = new Schema<UserInterface>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
});

const UserModel = model<UserInterface>("User", userSchema);
export default UserModel;
