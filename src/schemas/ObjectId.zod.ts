import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
	.string()
	.trim()
	.refine(mongoose.Types.ObjectId.isValid, {
		message: "Invalid ObjectId",
	});
