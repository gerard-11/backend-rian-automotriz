import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  cancel,
  complete,
  create,
  createQuickEntry,
  getById,
  list,
  update,
} from "./work-orders.controller.js";

export const workOrdersRouter = Router();

workOrdersRouter.use(requireAuth);
workOrdersRouter.post("/quick-entry", asyncHandler(createQuickEntry));
workOrdersRouter.post("/", asyncHandler(create));
workOrdersRouter.get("/", asyncHandler(list));
workOrdersRouter.get("/:id", asyncHandler(getById));
workOrdersRouter.patch("/:id", asyncHandler(update));
workOrdersRouter.post("/:id/complete", asyncHandler(complete));
workOrdersRouter.post("/:id/cancel", asyncHandler(cancel));
