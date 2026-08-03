import type { RequestHandler } from "express";
import { HttpError } from "../../lib/http-error.js";
import { AUTH_COOKIE_NAME } from "./auth.constants.js";
import { getCookieValue } from "./auth.cookies.js";
import { verifyAuthToken } from "./auth.service.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = getCookieValue(req.headers.cookie, AUTH_COOKIE_NAME);

  if (!token) {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  verifyAuthToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
};
