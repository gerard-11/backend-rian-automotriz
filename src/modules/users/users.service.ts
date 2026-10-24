import bcrypt from "bcrypt";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import type { CreateUserInput } from "./users.schemas.js";

export const createUser = async (input: CreateUserInput) => {
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    return await prisma.adminUser.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      throw new HttpError(409, "A user with this email already exists");
    }

    throw error;
  }
};
