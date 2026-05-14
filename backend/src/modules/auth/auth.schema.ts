import { z } from "zod";

export const PublicUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  email: z.email(),
});

export const AuthOutputSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string(),
});

export const RegisterInputSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.email(),
  password: z.string().min(8).max(64),
});
export type RegisterInputType = z.infer<typeof RegisterInputSchema>;

export const RegisterOutputSchema = AuthOutputSchema;
export type RegisterOutputType = z.infer<typeof RegisterOutputSchema>;

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
});
export type LoginInputType = z.infer<typeof LoginInputSchema>;

export const LoginOutputSchema = AuthOutputSchema;
export type LoginOutputType = z.infer<typeof LoginOutputSchema>;

//TODO: validate all the endpoints with schemas
