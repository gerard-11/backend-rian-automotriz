import type { RequestHandler } from "express";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
} from "./auth.constants.js";
import { loginSchema } from "./auth.schemas.js";
import { loginAdmin } from "./auth.service.js";

export const login: RequestHandler = async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, token } = await loginAdmin(input);

  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.json({ user });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  res.status(204).send();
};

export const me: RequestHandler = (req, res) => {
  res.json({ user: req.user });
};
