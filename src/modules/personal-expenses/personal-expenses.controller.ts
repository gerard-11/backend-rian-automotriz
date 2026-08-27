import type { RequestHandler } from "express";
import {
  createPersonalExpenseSchema,
  listPersonalExpensesQuerySchema,
  personalExpenseIdParamsSchema,
  updatePersonalExpenseSchema,
} from "./personal-expenses.schemas.js";
import {
  createPersonalExpense,
  deletePersonalExpense,
  getPersonalExpenseById,
  listPersonalExpenses,
  summarizePersonalExpenses,
  updatePersonalExpense,
} from "./personal-expenses.service.js";

export const create: RequestHandler = async (req, res) => {
  const input = createPersonalExpenseSchema.parse(req.body);
  const personalExpense = await createPersonalExpense(input);

  res.status(201).json({ personalExpense });
};

export const list: RequestHandler = async (req, res) => {
  const query = listPersonalExpensesQuerySchema.parse(req.query);
  const personalExpenses = await listPersonalExpenses(query);

  res.json({ personalExpenses });
};

export const summary: RequestHandler = async (req, res) => {
  const query = listPersonalExpensesQuerySchema.parse(req.query);
  const result = await summarizePersonalExpenses(query);

  res.json(result);
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = personalExpenseIdParamsSchema.parse(req.params);
  const personalExpense = await getPersonalExpenseById(id);

  res.json({ personalExpense });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = personalExpenseIdParamsSchema.parse(req.params);
  const input = updatePersonalExpenseSchema.parse(req.body);
  const personalExpense = await updatePersonalExpense(id, input);

  res.json({ personalExpense });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = personalExpenseIdParamsSchema.parse(req.params);
  await deletePersonalExpense(id);

  res.status(204).send();
};
