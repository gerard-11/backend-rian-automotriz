import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const tooManyRequestsMessage = {
  message: "Too many requests, please try again later",
};

const getLoginEmailKey = (body: unknown) => {
  if (
    body &&
    typeof body === "object" &&
    "email" in body &&
    typeof body.email === "string"
  ) {
    return body.email.trim().toLowerCase();
  }

  return "unknown";
};

export const apiRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooManyRequestsMessage,
});

export const loginIpRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
  message: tooManyRequestsMessage,
});

export const loginEmailRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => "login:" + getLoginEmailKey(req.body),
  skipSuccessfulRequests: true,
  message: tooManyRequestsMessage,
});
