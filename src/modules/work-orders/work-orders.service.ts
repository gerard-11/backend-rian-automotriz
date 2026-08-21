import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import {
  calculateServiceItemTotals,
  money,
} from "../service-items/service-items.utils.js";
import type {
  CreateQuickWorkOrderInput,
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

export const createQuickWorkOrder = async (
  input: CreateQuickWorkOrderInput,
) => {
  const totals = calculateServiceItemTotals(input.items);
  const status = input.status ?? "ACTIVE";

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
        status,
        diagnosis: input.diagnosis,
        notes: input.notes,
        advanceAmount: money(input.advanceAmount ?? 0),
        completedAt: status === "COMPLETED" ? new Date() : undefined,
        cancelledAt: status === "CANCELLED" ? new Date() : undefined,
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
        status: input.status,
        advanceAmount:
          input.advanceAmount === undefined
            ? undefined
            : money(input.advanceAmount),
        completedAt:
          input.status === "COMPLETED"
            ? new Date()
            : input.status === "ACTIVE"
              ? null
              : undefined,
        cancelledAt:
          input.status === "CANCELLED"
            ? new Date()
            : input.status === "ACTIVE" || input.status === "COMPLETED"
              ? null
              : undefined,
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
