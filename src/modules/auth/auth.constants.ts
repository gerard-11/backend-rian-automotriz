import type { CookieOptions } from "express";
import { isProduction } from "../../config/env.js";

export const AUTH_COOKIE_NAME = "rian_session";
export const AUTH_SESSION_SECONDS = 60 * 60 * 12;

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: AUTH_SESSION_SECONDS * 1000,
};

export const clearAuthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};
