import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import {
  calculateServiceItemTotals,
  money,
} from "../service-items/service-items.utils.js";
import type {
  CreateQuickWorkOrderInput,
  CreateWorkOrderInput,
  ListWorkOrdersQuery,
  UpdateWorkOrderInput,
} from "./work-orders.schemas.js";

export const workOrderSelect = {
  id: true,
  folio: true,
  customerId: true,
  vehicleId: true,
  budgetId: true,
  status: true,
  diagnosis: true,
  notes: true,
  advanceAmount: true,
  totalSaleAmount: true,
  totalCostAmount: true,
  grossProfitAmount: true,
  completedAt: true,
  cancelledAt: true,
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
  vehicle: {
    select: {
      id: true,
      plate: true,
      make: true,
      model: true,
      year: true,
      color: true,
    },
  },
  budget: {
    select: {
      id: true,
      folio: true,
    },
  },
  items: {
    select: {
      id: true,
      type: true,
      description: true,
      saleAmount: true,
      costAmount: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

const assertVehicleBelongsToCustomer = async (
  customerId: string,
  vehicleId: string,
) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { customerId: true },
  });

  if (!vehicle) {
    throw new HttpError(404, "Vehicle not found");
  }

  if (vehicle.customerId !== customerId) {
    throw new HttpError(400, "Vehicle does not belong to customer");
  }
};

export const createWorkOrder = async (input: CreateWorkOrderInput) => {
  await assertVehicleBelongsToCustomer(input.customerId, input.vehicleId);
  const totals = calculateServiceItemTotals(input.items);

  return prisma.workOrder.create({
    data: {
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      diagnosis: input.diagnosis,
      notes: input.notes,
      advanceAmount: money(input.advanceAmount ?? 0),
      totalSaleAmount: totals.totalSaleAmount,
      totalCostAmount: totals.totalCostAmount,
      grossProfitAmount: totals.profitAmount,
      items: {
        create: input.items.map((item) => ({
          type: item.type,
          description: item.description,
          saleAmount: money(item.saleAmount),
          costAmount:
            item.costAmount === undefined ? undefined : money(item.costAmount),
          notes: item.notes,
        })),
      },
    },
    select: workOrderSelect,
  });
};

export const createQuickWorkOrder = async (
  input: CreateQuickWorkOrderInput,
) => {
  const totals = calculateServiceItemTotals(input.items);

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: input.customer,
      select: { id: true },
    });

    const vehicle = await tx.vehicle.create({
      data: {
        ...input.vehicle,
        customerId: customer.id,
      },
      select: { id: true },
    });

    return tx.workOrder.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        diagnosis: input.diagnosis,
        notes: input.notes,
        advanceAmount: money(input.advanceAmount ?? 0),
        totalSaleAmount: totals.totalSaleAmount,
        totalCostAmount: totals.totalCostAmount,
        grossProfitAmount: totals.profitAmount,
        items: {
          create: input.items.map((item) => ({
            type: item.type,
            description: item.description,
            saleAmount: money(item.saleAmount),
            costAmount:
              item.costAmount === undefined
                ? undefined
                : money(item.costAmount),
            notes: item.notes,
          })),
        },
      },
      select: workOrderSelect,
    });
  });
};

export const listWorkOrders = (query: ListWorkOrdersQuery) => {
  const search = query.search?.trim();
  const folio = search && /^\d+$/.test(search) ? Number(search) : undefined;

  return prisma.workOrder.findMany({
    where: {
      customerId: query.customerId,
      vehicleId: query.vehicleId,
      status: query.status,
      ...(search
        ? {
            OR: [
              ...(folio ? [{ folio }] : []),
              { customer: { name: { contains: search, mode: "insensitive" } } },
              { vehicle: { plate: { contains: search, mode: "insensitive" } } },
              { vehicle: { make: { contains: search, mode: "insensitive" } } },
              { vehicle: { model: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    select: workOrderSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export const getWorkOrderById = async (id: string) => {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    select: workOrderSelect,
  });

  if (!workOrder) {
    throw new HttpError(404, "Work order not found");
  }

  return workOrder;
};

export const updateWorkOrder = async (
  id: string,
  input: UpdateWorkOrderInput,
) => {
  return prisma.$transaction(async (tx) => {
    const workOrder = await tx.workOrder.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!workOrder) {
      throw new HttpError(404, "Work order not found");
    }

    if (workOrder.status !== "ACTIVE") {
      throw new HttpError(409, "Only active work orders can be updated");
    }

    const totals = input.items
      ? calculateServiceItemTotals(input.items)
      : undefined;

    if (input.items) {
      await tx.workOrderItem.deleteMany({ where: { workOrderId: id } });
    }

    return tx.workOrder.update({
      where: { id },
      data: {
        diagnosis: input.diagnosis,
        notes: input.notes,
        advanceAmount:
          input.advanceAmount === undefined
            ? undefined
            : money(input.advanceAmount),
        totalSaleAmount: totals?.totalSaleAmount,
        totalCostAmount: totals?.totalCostAmount,
        grossProfitAmount: totals?.profitAmount,
        items: input.items
          ? {
              create: input.items.map((item) => ({
                type: item.type,
                description: item.description,
                saleAmount: money(item.saleAmount),
                costAmount:
                  item.costAmount === undefined
                    ? undefined
                    : money(item.costAmount),
                notes: item.notes,
              })),
            }
          : undefined,
      },
      select: workOrderSelect,
    });
  });
};

export const completeWorkOrder = async (id: string) => {
  const workOrder = await getWorkOrderById(id);

  if (workOrder.status !== "ACTIVE") {
    throw new HttpError(409, "Only active work orders can be completed");
  }

  return prisma.workOrder.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      cancelledAt: null,
    },
    select: workOrderSelect,
  });
};

export const cancelWorkOrder = async (id: string) => {
  const workOrder = await getWorkOrderById(id);

  if (workOrder.status !== "ACTIVE") {
    throw new HttpError(409, "Only active work orders can be cancelled");
  }

  return prisma.workOrder.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
    select: workOrderSelect,
  });
};
