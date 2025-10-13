import mongoose, { Document, Types } from "mongoose";

export interface BaseUser {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
}

// export interface UserInterface extends BaseUser, Document {
//   dateOfBirth: Date;
//   age?: number;
//   gender?: "Man" | "Woman" | "Non-binary";
//   photoUrl?: string;
//   about?: string;
//   skills?: string[];
//   getJWT: () => string; // Mongoose Method
//   matchPassword: (passwordInputByUser: string) => Promise<boolean>; // Mongoose Method
//   ageCalculate: (dob: Date) => number;
// }
interface UserInterface extends BaseUser, Document {
  dateOfBirth: Date;
  age: number;
  gender: "Man" | "Woman" | "Non-binary";
  photoUrl: string;
  about: string;
  skills: string[];
  getJWT: () => string; // Mongoose Method
  matchPassword: (passwordInputByUser: string) => Promise<boolean>; // Mongoose Method
  ageCalculate: (dob: Date) => number; // Mongoose Method
}

export interface ConnectionRequestInterface extends mongoose.Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: string;
}
export interface BaseEmailRecipient {
  emailId: string;
  firstName: string;
  lastName: string;
}

export interface AdminEmailRecipient extends BaseEmailRecipient {
  userId: string;
  subject: string;
  message: string;
}

export type UserDocument = Document<Types.ObjectId, {}, UserInterface> &
  UserInterface;
