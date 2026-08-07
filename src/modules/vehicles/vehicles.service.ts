import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import type {
  CreateVehicleInput,
  ListVehiclesQuery,
  UpdateVehicleInput,
} from "./vehicles.schemas.js";

const vehicleSelect = {
  id: true,
  customerId: true,
  plate: true,
  make: true,
  model: true,
  year: true,
  color: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  },
} as const;

const assertCustomerExists = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true },
  });

  if (!customer) {
    throw new HttpError(404, "Customer not found");
  }
};

export const createVehicle = async (input: CreateVehicleInput) => {
  await assertCustomerExists(input.customerId);

  return prisma.vehicle.create({
    data: input,
    select: vehicleSelect,
  });
};

export const listVehicles = (query: ListVehiclesQuery) => {
  const search = query.search?.trim();

  return prisma.vehicle.findMany({
    where: {
      customerId: query.customerId,
      ...(search
        ? {
            OR: [
              { plate: { contains: search, mode: "insensitive" } },
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { color: { contains: search, mode: "insensitive" } },
              { customer: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    select: vehicleSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export const getVehicleById = async (id: string) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: vehicleSelect,
  });

  if (!vehicle) {
    throw new HttpError(404, "Vehicle not found");
  }

  return vehicle;
};

export const updateVehicle = async (
  id: string,
  input: UpdateVehicleInput,
) => {
  await getVehicleById(id);

  return prisma.vehicle.update({
    where: { id },
    data: input,
    select: vehicleSelect,
  });
};
