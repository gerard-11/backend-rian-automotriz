import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
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
  updateStatus,
} from "./budgets.controller.js";

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);
budgetsRouter.post("/quick-entry", asyncHandler(createQuickEntry));
budgetsRouter.get("/", asyncHandler(list));
budgetsRouter.get("/:id", asyncHandler(getById));
budgetsRouter.patch("/:id", asyncHandler(update));
budgetsRouter.patch(
  "/:id/status",
  requireRole("ADMIN"),
  asyncHandler(updateStatus),
);
budgetsRouter.post("/:id/accept", asyncHandler(accept));
budgetsRouter.post("/:id/reject", requireRole("ADMIN"), asyncHandler(reject));
budgetsRouter.post("/:id/expire", asyncHandler(expire));
budgetsRouter.post("/:id/reopen", asyncHandler(reopen));
budgetsRouter.post("/:id/convert", asyncHandler(convert));
