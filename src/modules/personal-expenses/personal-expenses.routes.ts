import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  create,
  getById,
  list,
  remove,
  summary,
  update,
} from "./personal-expenses.controller.js";

export const personalExpensesRouter = Router();

personalExpensesRouter.use(requireAuth);
personalExpensesRouter.post("/", asyncHandler(create));
personalExpensesRouter.get("/", asyncHandler(list));
personalExpensesRouter.get("/summary", asyncHandler(summary));
personalExpensesRouter.get("/:id", asyncHandler(getById));
personalExpensesRouter.patch("/:id", asyncHandler(update));
personalExpensesRouter.delete("/:id", asyncHandler(remove));
