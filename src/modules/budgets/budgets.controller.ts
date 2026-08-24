import type { RequestHandler } from "express";
import {
  budgetIdParamsSchema,
  convertBudgetSchema,
  createQuickBudgetSchema,
  listBudgetsQuerySchema,
  reopenBudgetSchema,
  updateBudgetSchema,
} from "./budgets.schemas.js";
import {
  acceptBudget,
  convertBudgetToWorkOrder,
  createQuickBudget,
  expireBudget,
  getBudgetById,
  listBudgets,
  rejectBudget,
  reopenBudget,
  updateBudget,
} from "./budgets.service.js";

export const createQuickEntry: RequestHandler = async (req, res) => {
  const input = createQuickBudgetSchema.parse(req.body);
  const budget = await createQuickBudget(input);

  res.status(201).json({ budget });
};

export const list: RequestHandler = async (req, res) => {
  const query = listBudgetsQuerySchema.parse(req.query);
  const budgets = await listBudgets(query);

  res.json({ budgets });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await getBudgetById(id);

  res.json({ budget });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const input = updateBudgetSchema.parse(req.body);
  const budget = await updateBudget(id, input);

  res.json({ budget });
};

export const accept: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await acceptBudget(id);

  res.json({ budget });
};

export const reject: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await rejectBudget(id);

  res.json({ budget });
};

export const expire: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await expireBudget(id);

  res.json({ budget });
};

export const reopen: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const input = reopenBudgetSchema.parse(req.body);
  const budget = await reopenBudget(id, input);

  res.json({ budget });
};

export const convert: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const input = convertBudgetSchema.parse(req.body ?? {});
  const workOrder = await convertBudgetToWorkOrder(id, input);

  res.status(201).json({ workOrder });
};
