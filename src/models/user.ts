import { Schema, model, Document } from "mongoose";
import { z } from "zod";
import { userZodSchema } from "../schemas/User.zod.js";
export type UserType = z.infer<typeof userZodSchema> & Document; //Typescript Type
const userSchema = new Schema<UserType>(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
      maxlength: 20,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 15,
      max: 120,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      lowercase: true,
      validate(value: string) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error(
            "Gender data is invalid. Allowed values: 'male', 'female', 'other'."
          );
        }
      },
    },
    about: {
      type: String,
      trim: true,
    },
    skills: { type: [String] },
  },
  { timestamps: true }
);

const UserModel = model<UserType>("User", userSchema);
export default UserModel;
