import type { RequestHandler } from "express";
import {
  budgetIdParamsSchema,
  convertBudgetSchema,
  createQuickBudgetSchema,
  listBudgetsQuerySchema,
  reopenBudgetSchema,
  updateBudgetSchema,
  updateBudgetStatusSchema,
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
  presentBudgetForEmployee,
  updateBudget,
} from "./budgets.service.js";
import { presentWorkOrderForEmployee } from "../work-orders/work-orders.service.js";

const presentBudgetForRole = <
  T extends Parameters<typeof presentBudgetForEmployee>[0],
>(budget: T, role: "ADMIN" | "EMPLOYEE") =>
  role === "ADMIN" ? budget : presentBudgetForEmployee(budget);

export const createQuickEntry: RequestHandler = async (req, res) => {
  const input = createQuickBudgetSchema.parse(req.body);
  const budget = await createQuickBudget(input, req.user!.name);

  res.status(201).json({
    budget: presentBudgetForRole(budget, req.user!.role),
  });
};

export const list: RequestHandler = async (req, res) => {
  const query = listBudgetsQuerySchema.parse(req.query);
  const budgets = await listBudgets(query);

  res.json({
    budgets: budgets.map((budget) =>
      presentBudgetForRole(budget, req.user!.role),
    ),
  });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await getBudgetById(id);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const input = updateBudgetSchema.parse(req.body);
  const budget = await updateBudget(id, input);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const updateStatus: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  updateBudgetStatusSchema.parse(req.body);
  const budget = await rejectBudget(id);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const accept: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await acceptBudget(id);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const reject: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await rejectBudget(id);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const expire: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const budget = await expireBudget(id);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const reopen: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const input = reopenBudgetSchema.parse(req.body);
  const budget = await reopenBudget(id, input);

  res.json({ budget: presentBudgetForRole(budget, req.user!.role) });
};

export const convert: RequestHandler = async (req, res) => {
  const { id } = budgetIdParamsSchema.parse(req.params);
  const input = convertBudgetSchema.parse(req.body ?? {});
  const workOrder = await convertBudgetToWorkOrder(id, input, req.user!.name);

  res.status(201).json({
    workOrder:
      req.user!.role === "ADMIN"
        ? workOrder
        : presentWorkOrderForEmployee(workOrder),
  });
};
