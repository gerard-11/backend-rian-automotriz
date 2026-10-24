import type { RequestHandler } from "express";
import { createUserSchema } from "./users.schemas.js";
import { createUser as createUserService } from "./users.service.js";

export const createUser: RequestHandler = async (req, res) => {
  const input = createUserSchema.parse(req.body);
  const user = await createUserService(input);

  res.status(201).json({ user });
};
