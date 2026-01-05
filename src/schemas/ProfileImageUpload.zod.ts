import { z } from "zod";

export const profileImageUploadZodSchema = z.object({
	contentType: z.enum(["image/jpeg", "image/png", "image/jpg"]),
});
