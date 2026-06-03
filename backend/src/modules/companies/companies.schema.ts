import { z } from "zod";

export const CompanyOutputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  website: z.string().min(1).nullable(),
  location: z.string().min(1).nullable(),
  notes: z.string().min(1).nullable(),
});

export const ListCompanyOutputSchema = z.array(CompanyOutputSchema);

export const CreateCompanySchema = z.object({
  name: z.string().min(1),
  website: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});
export type CreateCompanyType = z.infer<typeof CreateCompanySchema>;

export const CompanyIdSchema = z.object({
  companyId: z.string().min(1),
});

export type CompanyIdType = z.infer<typeof CompanyIdSchema>;

export const UpdateCompanySchema = z.object({
  website: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});
export type UpdateCompanyType = z.infer<typeof UpdateCompanySchema>;
