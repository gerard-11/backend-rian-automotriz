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

export const moneySchema = z.coerce.number().finite().min(0).max(9_999_999.99);

export const positiveMoneySchema = moneySchema.min(
  0.01,
  "Amount must be greater than 0",
);

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDateInput = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  const match = dateOnlyPattern.exec(trimmed);

  if (!match) {
    return trimmed;
  }

  const [, year, month, day] = match;

  return new Date(Number(year), Number(month) - 1, Number(day), 12);
};

export const optionalDateSchema = z.preprocess(
  parseDateInput,
  z.coerce.date().optional(),
);
