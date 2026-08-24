import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import type {
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from "./expenses.schemas.js";

const expenseSelect = {
  id: true,
  description: true,
  amount: true,
  spentAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

const money = (value: number) => value.toFixed(2);

export const createExpense = async (input: CreateExpenseInput) => {
  return prisma.expense.create({
    data: {
      description: input.description,
      amount: money(input.amount),
      spentAt: input.spentAt,
      notes: input.notes,
    },
    select: expenseSelect,
  });
};

export const listExpenses = (query: ListExpensesQuery) => {
  const search = query.search?.trim();

  return prisma.expense.findMany({
    where: {
      spentAt:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom,
              lte: query.dateTo,
            }
          : undefined,
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: "insensitive" } },
              { notes: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: expenseSelect,
    orderBy: { spentAt: "desc" },
    take: 200,
  });
};

export const getExpenseById = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    select: expenseSelect,
  });

  if (!expense) {
    throw new HttpError(404, "Expense not found");
  }

  return expense;
};

export const updateExpense = async (id: string, input: UpdateExpenseInput) => {
  await getExpenseById(id);

  return prisma.expense.update({
    where: { id },
    data: {
      description: input.description,
      amount: input.amount === undefined ? undefined : money(input.amount),
      spentAt: input.spentAt,
      notes: input.notes,
    },
    select: expenseSelect,
  });
};

export const deleteExpense = async (id: string) => {
  await getExpenseById(id);
  await prisma.expense.delete({ where: { id } });
};
