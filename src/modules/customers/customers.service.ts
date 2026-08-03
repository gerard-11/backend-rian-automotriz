import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import type {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
} from "./customers.schemas.js";

const customerSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const createCustomer = (input: CreateCustomerInput) => {
  return prisma.customer.create({
    data: input,
    select: customerSelect,
  });
};

export const listCustomers = (query: ListCustomersQuery) => {
  const search = query.search?.trim();

  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: customerSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: customerSelect,
  });

  if (!customer) {
    throw new HttpError(404, "Customer not found");
  }

  return customer;
};

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput,
) => {
  await getCustomerById(id);

  return prisma.customer.update({
    where: { id },
    data: input,
    select: customerSelect,
  });
};
