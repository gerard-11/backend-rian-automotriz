import type { RequestHandler } from "express";
import {
  createExpenseCategorySchema,
  createExpenseSchema,
  expenseCategoryIdParamsSchema,
  expenseIdParamsSchema,
  listExpensesQuerySchema,
  updateExpenseCategorySchema,
  updateExpenseSchema,
} from "./expenses.schemas.js";
import {
  createExpense,
  createExpenseCategory,
  deleteExpense,
  getExpenseById,
  listExpenseCategories,
  listExpenses,
  updateExpense,
  updateExpenseCategory,
} from "./expenses.service.js";

export const createCategory: RequestHandler = async (req, res) => {
  const input = createExpenseCategorySchema.parse(req.body);
  const category = await createExpenseCategory(input);

  res.status(201).json({ category });
};

export const listCategories: RequestHandler = async (_req, res) => {
  const categories = await listExpenseCategories();

  res.json({ categories });
};

export const updateCategory: RequestHandler = async (req, res) => {
  const { id } = expenseCategoryIdParamsSchema.parse(req.params);
  const input = updateExpenseCategorySchema.parse(req.body);
  const category = await updateExpenseCategory(id, input);

  res.json({ category });
};

export const create: RequestHandler = async (req, res) => {
  const input = createExpenseSchema.parse(req.body);
  const expense = await createExpense(input);

  res.status(201).json({ expense });
};

export const list: RequestHandler = async (req, res) => {
  const query = listExpensesQuerySchema.parse(req.query);
  const expenses = await listExpenses(query);

  res.json({ expenses });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = expenseIdParamsSchema.parse(req.params);
  const expense = await getExpenseById(id);

  res.json({ expense });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = expenseIdParamsSchema.parse(req.params);
  const input = updateExpenseSchema.parse(req.body);
  const expense = await updateExpense(id, input);

  res.json({ expense });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = expenseIdParamsSchema.parse(req.params);
  await deleteExpense(id);

  res.status(204).send();
};
