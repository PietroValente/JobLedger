import { z } from "zod";

export const ErrorOutputSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});
export type ErrorOutputType = z.infer<typeof ErrorOutputSchema>;
