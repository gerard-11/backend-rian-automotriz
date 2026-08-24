import { z } from "zod";
import { optionalDateSchema } from "../../lib/validation.js";

export const weeklyProfitQuerySchema = z.object({
  weekStart: optionalDateSchema,
});

export const closeWeeklyProfitSchema = z.object({
  weekStart: optionalDateSchema,
});

export const listWeeklyProfitsQuerySchema = z.object({
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
});

export type WeeklyProfitQuery = z.infer<typeof weeklyProfitQuerySchema>;
export type CloseWeeklyProfitInput = z.infer<typeof closeWeeklyProfitSchema>;
export type ListWeeklyProfitsQuery = z.infer<
  typeof listWeeklyProfitsQuerySchema
>;
