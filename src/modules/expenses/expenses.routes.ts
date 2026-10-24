import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "./expenses.controller.js";

export const expensesRouter = Router();

expensesRouter.use(requireAuth);
expensesRouter.use(requireRole("ADMIN"));
expensesRouter.post("/", asyncHandler(create));
expensesRouter.get("/", asyncHandler(list));
expensesRouter.get("/:id", asyncHandler(getById));
expensesRouter.patch("/:id", asyncHandler(update));
expensesRouter.delete("/:id", asyncHandler(remove));
