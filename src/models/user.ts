import { Schema, model, Document } from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import { z } from "zod";
import { userZodSchema } from "../schemas/User.zod.js";
import validator from "validator";
import bcrypt from "bcrypt";
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  age: number;
  gender: "male" | "female" | "other";
  photoUrl?: string;
  about?: string;
  skills?: string[];
  getJWT: () => string; // Mongoose Method
  matchPassword: (passwordInputByUser: string) => Promise<boolean>; // Mongoose Method
}

// ✅ Infer Type from Zod and Extend It
export type UserType = z.infer<typeof userZodSchema> & IUser;
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
      validate: (value: string) => {
        if (!validator.isEmail(value)) {
          throw new Error("Email address is invalid format.");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: (value: string) => {
        console.log(
          "pswd validate:: ",
          validator.isStrongPassword(value).valueOf()
        );
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
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
      validate: (value: string) => {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error(
            "Gender data is invalid. Allowed values: 'male', 'female', 'other'."
          );
        }
      },
    },
    photoUrl: {
      type: String,
      validate: (value: string) => {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL format");
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

//this keyword points the current instance of the userSchema
//any new user is a instance of userSchema
userSchema.methods.getJWT = function () {
  const JWT_SECRET_KEY: Secret = "Dev$5681%CodeHrithik&54354";
  const user = this;
  const token = jwt.sign({ _id: user._id }, JWT_SECRET_KEY);
  return token;
};

userSchema.methods.matchPassword = async function (
  passwordInputByUser: string
) {
  const passwordHashFromDB = this.password;
  const isMatch = await bcrypt.compare(passwordInputByUser, passwordHashFromDB);
  return isMatch;
};
const UserModel = model<UserType>("User", userSchema);
export default UserModel;
