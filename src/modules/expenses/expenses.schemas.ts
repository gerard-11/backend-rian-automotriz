import { z } from "zod";
import {
  moneySchema,
  optionalDateSchema,
  optionalText,
} from "../../lib/validation.js";

export const expenseIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const expenseCategoryIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createExpenseCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const updateExpenseCategorySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    active: z.coerce.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid().optional(),
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
  categoryId: z.string().uuid().optional(),
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  search: z.string().trim().optional(),
});

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>;
export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
