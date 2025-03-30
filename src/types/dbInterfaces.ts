import mongoose, { Document } from "mongoose";

enum genderEnum {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}
export interface UserInterface extends Document {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  dateOfBirth: Date;
  age?: number;
  gender: genderEnum;
  photoUrl: string;
  about: string;
  skills: string[];
  getJWT: () => string; // Mongoose Method
  matchPassword: (passwordInputByUser: string) => Promise<boolean>; // Mongoose Method
  ageCalculate: (dob: Date) => number;
}

export interface ConnectionRequestInterface extends mongoose.Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: string;
}
