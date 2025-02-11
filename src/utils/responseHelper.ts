import { Response } from "express";
import { responseZodSchema } from "../schemas/Response.zod.js";
import { z } from "zod";

type ApiResponseType = z.infer<typeof responseZodSchema>; // TypeScript type

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null,
  errors: { field: string; message: string }[] | null = null
): void => {
  const responseObject: ApiResponseType = {
    success,
    message,
    ...(data && { data }),
    ...(errors && { errors }),
  };

  // Validate response using Zod
  const parsedResponse = responseZodSchema.safeParse(responseObject);
  if (!parsedResponse.success) {
    console.error("Invalid response format:", parsedResponse.error.format());
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: [{ field: "response", message: "Invalid response format" }],
    });
  }

  res.status(statusCode).json(responseObject);
};
