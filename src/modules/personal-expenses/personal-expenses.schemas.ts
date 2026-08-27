import { z } from "zod";
import {
  optionalDateSchema,
  optionalText,
  positiveMoneySchema,
} from "../../lib/validation.js";

export const personalExpenseIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createPersonalExpenseSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  amount: positiveMoneySchema,
  spentAt: optionalDateSchema,
  notes: optionalText,
});

export const updatePersonalExpenseSchema = createPersonalExpenseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listPersonalExpensesQuerySchema = z.object({
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  search: z.string().trim().optional(),
});

export type CreatePersonalExpenseInput = z.infer<
  typeof createPersonalExpenseSchema
>;
export type UpdatePersonalExpenseInput = z.infer<
  typeof updatePersonalExpenseSchema
>;
export type ListPersonalExpensesQuery = z.infer<
  typeof listPersonalExpensesQuerySchema
>;
