import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  create,
  createCategory,
  getById,
  list,
  listCategories,
  remove,
  update,
  updateCategory,
} from "./expenses.controller.js";

export const expensesRouter = Router();

expensesRouter.use(requireAuth);
expensesRouter.post("/categories", asyncHandler(createCategory));
expensesRouter.get("/categories", asyncHandler(listCategories));
expensesRouter.patch("/categories/:id", asyncHandler(updateCategory));
expensesRouter.post("/", asyncHandler(create));
expensesRouter.get("/", asyncHandler(list));
expensesRouter.get("/:id", asyncHandler(getById));
expensesRouter.patch("/:id", asyncHandler(update));
expensesRouter.delete("/:id", asyncHandler(remove));
