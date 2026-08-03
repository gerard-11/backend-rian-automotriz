import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { login, logout, me } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(login));
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
