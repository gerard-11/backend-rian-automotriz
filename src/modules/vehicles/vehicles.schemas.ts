import { z } from "zod";
import { optionalText } from "../../lib/validation.js";

export const vehicleIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createVehicleSchema = z.object({
  customerId: z.string().uuid(),
  plate: optionalText,
  make: optionalText,
  model: optionalText,
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: optionalText,
  notes: optionalText,
});

export const updateVehicleSchema = createVehicleSchema
  .omit({ customerId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listVehiclesQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;
