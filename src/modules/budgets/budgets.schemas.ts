import { z } from "zod";
import {
  moneySchema,
  positiveMoneySchema,
  optionalDateSchema,
  optionalEmail,
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
const requiredText = z.string().trim().min(1);

export const budgetIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const budgetItemSchema = z
  .object({
    type: itemTypeSchema.default("SERVICE"),
    description: z.string().trim().min(1, "Description is required"),
    saleAmount: positiveMoneySchema,
    costAmount: moneySchema.default(0),
    notes: optionalText,
  })
  .superRefine((item, ctx) => {
    if (
      (item.type === "PART" || item.type === "TIRE") &&
      item.costAmount <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["costAmount"],
        message: "Cost amount must be greater than 0 for parts and tires",
      });
    }
  });

export const createBudgetSchema = z.object({
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  diagnosis: optionalText,
  notes: optionalText,
  validUntil: optionalDateSchema,
  items: z.array(budgetItemSchema).min(1, "At least one item is required"),
});

const quickBudgetCustomerSchema = z.object({
  name: requiredText,
  phone: optionalText,
  email: optionalEmail,
  notes: optionalText,
});

const quickBudgetVehicleSchema = z
  .object({
    plate: optionalText,
    make: optionalText,
    model: optionalText,
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    color: optionalText,
    notes: optionalText,
  })
  .refine(
    (vehicle) => Boolean(vehicle.plate || vehicle.make || vehicle.model),
    {
      message: "Vehicle is required",
    },
  );

export const createQuickBudgetSchema = z.object({
  customer: quickBudgetCustomerSchema,
  vehicle: quickBudgetVehicleSchema,
  diagnosis: requiredText,
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
export type CreateQuickBudgetInput = z.infer<typeof createQuickBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ConvertBudgetInput = z.infer<typeof convertBudgetSchema>;
export type ReopenBudgetInput = z.infer<typeof reopenBudgetSchema>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
