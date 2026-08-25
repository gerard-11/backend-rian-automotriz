import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(key + " is required");
  }

  return value;
};

const databaseUrl = requiredEnv("DATABASE_URL");
const adminEmail = requiredEnv("ADMIN_EMAIL").toLowerCase();
const adminPassword = requiredEnv("ADMIN_PASSWORD");
const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

if (adminPassword.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const main = async () => {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
    select: { id: true, email: true },
  });

  if (existingAdmin) {
    console.log("Admin user already exists: " + existingAdmin.email);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.adminUser.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      active: true,
    },
    select: {
      email: true,
    },
  });

  console.log("Admin user created: " + admin.email);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
