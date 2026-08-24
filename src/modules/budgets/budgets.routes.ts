import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  accept,
  convert,
  createQuickEntry,
  expire,
  getById,
  list,
  reject,
  reopen,
  update,
} from "./budgets.controller.js";

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);
budgetsRouter.post("/quick-entry", asyncHandler(createQuickEntry));
budgetsRouter.get("/", asyncHandler(list));
budgetsRouter.get("/:id", asyncHandler(getById));
budgetsRouter.patch("/:id", asyncHandler(update));
budgetsRouter.post("/:id/accept", asyncHandler(accept));
budgetsRouter.post("/:id/reject", asyncHandler(reject));
budgetsRouter.post("/:id/expire", asyncHandler(expire));
budgetsRouter.post("/:id/reopen", asyncHandler(reopen));
budgetsRouter.post("/:id/convert", asyncHandler(convert));
