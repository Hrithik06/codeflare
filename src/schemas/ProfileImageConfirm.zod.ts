import { z } from "zod";

export const profileImageConfirmZodSchema = z.object({
	key: z.string().min(1, "S3 key is required"),
	contentType: z.enum(["image/jpeg", "image/png"]),
});
