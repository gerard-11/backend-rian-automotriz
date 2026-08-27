import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  cancel,
  complete,
  createQuickEntry,
  getById,
  list,
  remove,
  update,
} from "./work-orders.controller.js";

export const workOrdersRouter = Router();

workOrdersRouter.use(requireAuth);
workOrdersRouter.post("/quick-entry", asyncHandler(createQuickEntry));
workOrdersRouter.get("/", asyncHandler(list));
workOrdersRouter.get("/:id", asyncHandler(getById));
workOrdersRouter.patch("/:id", asyncHandler(update));
workOrdersRouter.delete("/:id", asyncHandler(remove));
workOrdersRouter.post("/:id/complete", asyncHandler(complete));
workOrdersRouter.post("/:id/cancel", asyncHandler(cancel));
