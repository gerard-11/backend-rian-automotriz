import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { AUTH_SESSION_SECONDS } from "./auth.constants.js";
import type { LoginInput } from "./auth.schemas.js";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

type AuthTokenPayload = {
  sub: string;
  email: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  active: true,
} as const;

const toAuthenticatedUser = (user: {
  id: string;
  name: string;
  email: string;
}): AuthenticatedUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const loginAdmin = async (
  input: LoginInput,
): Promise<{ user: AuthenticatedUser; token: string }> => {
  const user = await prisma.adminUser.findUnique({
    where: { email: input.email },
    select: userSelect,
  });

  if (!user || !user.active) {
    throw new HttpError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
    } satisfies AuthTokenPayload,
    env.JWT_SECRET,
    { expiresIn: AUTH_SESSION_SECONDS },
  );

  return {
    user: toAuthenticatedUser(user),
    token,
  };
};

export const verifyAuthToken = async (
  token: string,
): Promise<AuthenticatedUser> => {
  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Invalid session");
  }

  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new HttpError(401, "Invalid session");
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
    },
  });

  if (!user || !user.active) {
    throw new HttpError(401, "Invalid session");
  }

  return toAuthenticatedUser(user);
};
