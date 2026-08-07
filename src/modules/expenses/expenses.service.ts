import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import type {
  CreateExpenseCategoryInput,
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseCategoryInput,
  UpdateExpenseInput,
} from "./expenses.schemas.js";

const categorySelect = {
  id: true,
  name: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

const expenseSelect = {
  id: true,
  categoryId: true,
  description: true,
  amount: true,
  spentAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: categorySelect,
  },
} as const;

const money = (value: number) => value.toFixed(2);

const assertCategoryExists = async (categoryId: string) => {
  const category = await prisma.expenseCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, active: true },
  });

  if (!category) {
    throw new HttpError(404, "Expense category not found");
  }

  if (!category.active) {
    throw new HttpError(409, "Expense category is inactive");
  }
};

export const createExpenseCategory = (input: CreateExpenseCategoryInput) => {
  return prisma.expenseCategory.create({
    data: input,
    select: categorySelect,
  });
};

export const listExpenseCategories = () => {
  return prisma.expenseCategory.findMany({
    select: categorySelect,
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
};

export const updateExpenseCategory = async (
  id: string,
  input: UpdateExpenseCategoryInput,
) => {
  const category = await prisma.expenseCategory.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!category) {
    throw new HttpError(404, "Expense category not found");
  }

  return prisma.expenseCategory.update({
    where: { id },
    data: input,
    select: categorySelect,
  });
};

export const createExpense = async (input: CreateExpenseInput) => {
  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }

  return prisma.expense.create({
    data: {
      categoryId: input.categoryId,
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
      categoryId: query.categoryId,
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
              { category: { name: { contains: search, mode: "insensitive" } } },
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

  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }

  return prisma.expense.update({
    where: { id },
    data: {
      categoryId: input.categoryId,
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
