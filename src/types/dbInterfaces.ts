import { Document } from "mongoose";
export interface UserInterface extends Document {
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