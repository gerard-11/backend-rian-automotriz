import { z } from "zod";
import {
  moneySchema,
  optionalDateSchema,
  optionalText,
} from "../../lib/validation.js";

export const expenseIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createExpenseSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  amount: moneySchema,
  spentAt: optionalDateSchema,
  notes: optionalText,
});

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listExpensesQuerySchema = z.object({
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  search: z.string().trim().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
