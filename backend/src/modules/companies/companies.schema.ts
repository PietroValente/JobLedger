import { z } from "zod";

export const CompanyOutput = z.object({
  name: z.string().min(1),
  website: z.string().min(1).nullable(),
  location: z.string().min(1).nullable(),
  notes: z.string().min(1).nullable(),
});

export const ListCompanyOutput = z.array(CompanyOutput);

export const CreateCompanySchema = z.object({
  name: z.string().min(1),
  website: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});
export type CreateCompanyType = z.infer<typeof CreateCompanySchema>;
