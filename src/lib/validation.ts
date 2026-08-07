import { z } from "zod";

export const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().optional(),
);

export const optionalEmail = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().email().optional(),
);

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const moneySchema = z.coerce
  .number()
  .finite()
  .min(0)
  .max(9_999_999.99);

export const optionalDateSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.coerce.date().optional(),
);
