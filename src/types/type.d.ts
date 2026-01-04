import { Request } from "express";
import { UserDocument } from "./dbInterfaces.ts";

// declare global {
// 	namespace Express {
// 		interface Request {
// 			validatedData?: ValidatedType;
// 			user: UserDocument & mongoose.Document; // attaching data after login
// 		}
// 	}
// }
declare global {
	namespace Express {
		interface Request {
			validatedData?: unknown;
			user?: UserDocument;
		}
	}
}
