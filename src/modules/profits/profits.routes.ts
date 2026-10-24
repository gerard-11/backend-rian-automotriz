import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import {
  calculateWeekly,
  closeWeekly,
  listWeeklyHistory,
} from "./profits.controller.js";

export const profitsRouter = Router();

profitsRouter.use(requireAuth);
profitsRouter.use(requireRole("ADMIN"));
profitsRouter.get("/weekly/history", asyncHandler(listWeeklyHistory));
profitsRouter.get("/weekly", asyncHandler(calculateWeekly));
profitsRouter.post("/weekly/close", asyncHandler(closeWeekly));
