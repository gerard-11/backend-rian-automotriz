import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import type {
  CreatePersonalExpenseInput,
  ListPersonalExpensesQuery,
  UpdatePersonalExpenseInput,
} from "./personal-expenses.schemas.js";

const personalExpenseSelect = {
  id: true,
  description: true,
  amount: true,
  spentAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

const money = (value: number) => value.toFixed(2);

const decimalToNumber = (value: unknown) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(String(value));
};

const buildWhere = (query: ListPersonalExpensesQuery) => {
  const search = query.search?.trim();

  return {
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
            { description: { contains: search, mode: "insensitive" as const } },
            { notes: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
};

export const createPersonalExpense = async (
  input: CreatePersonalExpenseInput,
) => {
  return prisma.personalExpense.create({
    data: {
      description: input.description,
      amount: money(input.amount),
      spentAt: input.spentAt,
      notes: input.notes,
    },
    select: personalExpenseSelect,
  });
};

export const listPersonalExpenses = (query: ListPersonalExpensesQuery) => {
  return prisma.personalExpense.findMany({
    where: buildWhere(query),
    select: personalExpenseSelect,
    orderBy: { spentAt: "desc" },
    take: 200,
  });
};

export const getPersonalExpenseById = async (id: string) => {
  const personalExpense = await prisma.personalExpense.findUnique({
    where: { id },
    select: personalExpenseSelect,
  });

  if (!personalExpense) {
    throw new HttpError(404, "Personal expense not found");
  }

  return personalExpense;
};

export const updatePersonalExpense = async (
  id: string,
  input: UpdatePersonalExpenseInput,
) => {
  await getPersonalExpenseById(id);

  return prisma.personalExpense.update({
    where: { id },
    data: {
      description: input.description,
      amount: input.amount === undefined ? undefined : money(input.amount),
      spentAt: input.spentAt,
      notes: input.notes,
    },
    select: personalExpenseSelect,
  });
};

export const deletePersonalExpense = async (id: string) => {
  await getPersonalExpenseById(id);
  await prisma.personalExpense.delete({ where: { id } });
};

export const summarizePersonalExpenses = async (
  query: ListPersonalExpensesQuery,
) => {
  const summary = await prisma.personalExpense.aggregate({
    where: buildWhere(query),
    _sum: { amount: true },
    _count: { _all: true },
  });

  return {
    totalAmount: money(decimalToNumber(summary._sum.amount)),
    expenseCount: summary._count._all,
  };
};
