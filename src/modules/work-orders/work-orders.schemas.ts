import { z } from "zod";
import {
  moneySchema,
  optionalEmail,
  optionalText,
} from "../../lib/validation.js";

const workOrderStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
const itemTypeSchema = z.enum(["SERVICE", "LABOR", "PART", "TIRE", "OTHER"]);

export const workOrderIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const workOrderItemSchema = z.object({
  type: itemTypeSchema,
  description: z.string().trim().min(1, "Description is required"),
  saleAmount: moneySchema,
  costAmount: moneySchema.optional(),
  notes: optionalText,
});

const quickWorkOrderCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: optionalText,
  email: optionalEmail,
  notes: optionalText,
});

const quickWorkOrderVehicleSchema = z.object({
  plate: optionalText,
  make: optionalText,
  model: optionalText,
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: optionalText,
  notes: optionalText,
});

export const createQuickWorkOrderSchema = z.object({
  customer: quickWorkOrderCustomerSchema,
  vehicle: quickWorkOrderVehicleSchema,
  status: workOrderStatusSchema.optional(),
  diagnosis: optionalText,
  notes: optionalText,
  advanceAmount: moneySchema.optional(),
  items: z.array(workOrderItemSchema).min(1, "At least one item is required"),
});

export const updateWorkOrderSchema = z
  .object({
    diagnosis: optionalText,
    notes: optionalText,
    status: workOrderStatusSchema.optional(),
    advanceAmount: moneySchema.optional(),
    items: z.array(workOrderItemSchema).min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listWorkOrdersQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  status: workOrderStatusSchema.optional(),
  search: z.string().trim().optional(),
});

export type WorkOrderItemInput = z.infer<typeof workOrderItemSchema>;
export type CreateQuickWorkOrderInput = z.infer<
  typeof createQuickWorkOrderSchema
>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type ListWorkOrdersQuery = z.infer<typeof listWorkOrdersQuerySchema>;
