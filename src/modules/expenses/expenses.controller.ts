import type { RequestHandler } from "express";
import {
  createExpenseSchema,
  expenseIdParamsSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "./expenses.schemas.js";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  listExpenses,
  updateExpense,
} from "./expenses.service.js";

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
