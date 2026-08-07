import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { create, getById, list, update } from "./vehicles.controller.js";

export const vehiclesRouter = Router();

vehiclesRouter.use(requireAuth);
vehiclesRouter.post("/", asyncHandler(create));
vehiclesRouter.get("/", asyncHandler(list));
vehiclesRouter.get("/:id", asyncHandler(getById));
vehiclesRouter.patch("/:id", asyncHandler(update));
