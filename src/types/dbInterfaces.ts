import mongoose, { Document } from "mongoose";

enum genderEnum {
  Male = "male",
  Female = "female",
  Other = "other"
}
export interface UserInterface extends Document {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  age: number;
  gender: genderEnum;
  photoUrl?: string;
  about?: string;
  skills?: string[];
  getJWT: () => string; // Mongoose Method
  matchPassword: (passwordInputByUser: string) => Promise<boolean>; // Mongoose Method
}

enum statusEnum {
  interested = "interested",
  ignored = "ignored",
  accepted = "accepted",
  rejected = "rejected"
}
export interface ConnectionRequestInterface extends mongoose.Document {
  fromUserId: mongoose.Schema.Types.ObjectId;
  toUserId: mongoose.Schema.Types.ObjectId;
  status: statusEnum;
}