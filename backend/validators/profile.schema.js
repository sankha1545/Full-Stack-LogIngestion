import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    username: z.string().min(3).optional(),

    country: z.string().optional().nullable(),
    countryCode: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
  }),
});
