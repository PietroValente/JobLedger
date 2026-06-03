import { z } from "zod";

export const ApplicationOutputSchema = z.object({
  id: z.number(),
  role: z.string().min(1),
  status: z.string().min(1),
  jobUrl: z.string().min(1).nullable(),
  description: z.string().min(1).nullable(),
  notes: z.string().min(1).nullable(),
});

export const ListApplicationOutputSchema = z.array(ApplicationOutputSchema);

export const CreateApplicationSchema = z.object({
  role: z.string().min(1),
  status: z.string().min(1),
  jobUrl: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});
export type CreateApplicationType = z.infer<typeof CreateApplicationSchema>;

export const UpdateApplicationSchema = z.object({
  role: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  jobUrl: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});
export type UpdateApplicationType = z.infer<typeof UpdateApplicationSchema>;

export const ApplicationIdSchema = z.object({
  companyId: z.string().min(1),
  applicationId: z.coerce.number(),
});

export type ApplicationIdType = z.infer<typeof ApplicationIdSchema>;
