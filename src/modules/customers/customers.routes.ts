import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { create, getById, list, update } from "./customers.controller.js";

export const customersRouter = Router();

customersRouter.use(requireAuth);
customersRouter.post("/", asyncHandler(create));
customersRouter.get("/", asyncHandler(list));
customersRouter.get("/:id", asyncHandler(getById));
customersRouter.patch("/:id", asyncHandler(update));
