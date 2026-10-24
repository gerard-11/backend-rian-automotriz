import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { createUser } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole("ADMIN"));
usersRouter.post("/", asyncHandler(createUser));
