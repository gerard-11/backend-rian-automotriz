import { z } from "zod";
import {
  moneySchema,
  optionalDateSchema,
  optionalText,
} from "../../lib/validation.js";

const budgetStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
]);

const itemTypeSchema = z.enum(["SERVICE", "LABOR", "PART", "TIRE", "OTHER"]);

export const budgetIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const budgetItemSchema = z.object({
  type: itemTypeSchema,
  description: z.string().trim().min(1, "Description is required"),
  saleAmount: moneySchema,
  costAmount: moneySchema.optional(),
  notes: optionalText,
});

export const createBudgetSchema = z.object({
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  diagnosis: optionalText,
  notes: optionalText,
  validUntil: optionalDateSchema,
  items: z.array(budgetItemSchema).min(1, "At least one item is required"),
});

export const updateBudgetSchema = z
  .object({
    diagnosis: optionalText,
    notes: optionalText,
    validUntil: optionalDateSchema,
    items: z.array(budgetItemSchema).min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const convertBudgetSchema = z.object({
  advanceAmount: moneySchema.optional(),
  notes: optionalText,
});

export const reopenBudgetSchema = z.object({
  validUntil: optionalDateSchema,
});

export const listBudgetsQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  status: budgetStatusSchema.optional(),
  search: z.string().trim().optional(),
});

export type BudgetItemInput = z.infer<typeof budgetItemSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ConvertBudgetInput = z.infer<typeof convertBudgetSchema>;
export type ReopenBudgetInput = z.infer<typeof reopenBudgetSchema>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
