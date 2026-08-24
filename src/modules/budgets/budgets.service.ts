import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import {
  calculateServiceItemTotals,
  money,
} from "../service-items/service-items.utils.js";
import type {
  ConvertBudgetInput,
  CreateQuickBudgetInput,
  ListBudgetsQuery,
  ReopenBudgetInput,
  UpdateBudgetInput,
} from "./budgets.schemas.js";

const BUDGET_VALID_DAYS = 15;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const budgetSelect = {
  id: true,
  folio: true,
  customerId: true,
  vehicleId: true,
  status: true,
  diagnosis: true,
  notes: true,
  totalSaleAmount: true,
  totalCostAmount: true,
  estimatedProfitAmount: true,
  validUntil: true,
  acceptedAt: true,
  rejectedAt: true,
  convertedAt: true,
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

const getDefaultValidUntil = () =>
  new Date(Date.now() + BUDGET_VALID_DAYS * DAY_IN_MS);

const expireOverdueBudgets = async () => {
  const now = new Date();
  const createdAtCutoff = new Date(
    now.getTime() - BUDGET_VALID_DAYS * DAY_IN_MS,
  );

  await prisma.budget.updateMany({
    where: {
      status: "PENDING",
      OR: [
        { validUntil: { lt: now } },
        { validUntil: null, createdAt: { lt: createdAtCutoff } },
      ],
    },
    data: { status: "EXPIRED" },
  });
};

export const createQuickBudget = async (input: CreateQuickBudgetInput) => {
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

    return tx.budget.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        diagnosis: input.diagnosis,
        notes: input.notes,
        validUntil: input.validUntil ?? getDefaultValidUntil(),
        totalSaleAmount: totals.totalSaleAmount,
        totalCostAmount: totals.totalCostAmount,
        estimatedProfitAmount: totals.profitAmount,
        items: {
          create: input.items.map((item) => ({
            type: item.type,
            description: item.description,
            saleAmount: money(item.saleAmount),
            costAmount: money(item.costAmount),
            notes: item.notes,
          })),
        },
      },
      select: budgetSelect,
    });
  });
};

export const listBudgets = (query: ListBudgetsQuery) => {
  const search = query.search?.trim();
  const folio = search && /^\d+$/.test(search) ? Number(search) : undefined;

  return prisma.budget.findMany({
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
    select: budgetSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
};

export const getBudgetById = async (id: string) => {
  await expireOverdueBudgets();

  const budget = await prisma.budget.findUnique({
    where: { id },
    select: budgetSelect,
  });

  if (!budget) {
    throw new HttpError(404, "Budget not found");
  }

  return budget;
};

export const updateBudget = async (id: string, input: UpdateBudgetInput) => {
  await expireOverdueBudgets();

  return prisma.$transaction(async (tx) => {
    const budget = await tx.budget.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!budget) {
      throw new HttpError(404, "Budget not found");
    }

    if (budget.status === "CONVERTED") {
      throw new HttpError(409, "Converted budgets cannot be updated");
    }

    if (budget.status === "EXPIRED") {
      throw new HttpError(
        409,
        "Expired budgets must be reopened before update",
      );
    }

    const totals = input.items
      ? calculateServiceItemTotals(input.items)
      : undefined;

    if (input.items) {
      await tx.budgetItem.deleteMany({ where: { budgetId: id } });
    }

    return tx.budget.update({
      where: { id },
      data: {
        diagnosis: input.diagnosis,
        notes: input.notes,
        validUntil: input.validUntil,
        totalSaleAmount: totals?.totalSaleAmount,
        totalCostAmount: totals?.totalCostAmount,
        estimatedProfitAmount: totals?.profitAmount,
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
      select: budgetSelect,
    });
  });
};

export const acceptBudget = async (id: string) => {
  const budget = await getBudgetById(id);

  if (budget.status === "CONVERTED") {
    throw new HttpError(409, "Converted budgets cannot change status");
  }

  if (budget.status !== "PENDING") {
    throw new HttpError(409, "Only pending budgets can be accepted");
  }

  return prisma.budget.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      rejectedAt: null,
    },
    select: budgetSelect,
  });
};

export const rejectBudget = async (id: string) => {
  const budget = await getBudgetById(id);

  if (budget.status === "CONVERTED") {
    throw new HttpError(409, "Converted budgets cannot change status");
  }

  return prisma.budget.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
    },
    select: budgetSelect,
  });
};

export const expireBudget = async (id: string) => {
  const budget = await getBudgetById(id);

  if (budget.status === "CONVERTED") {
    throw new HttpError(409, "Converted budgets cannot change status");
  }

  return prisma.budget.update({
    where: { id },
    data: {
      status: "EXPIRED",
    },
    select: budgetSelect,
  });
};

export const reopenBudget = async (id: string, input: ReopenBudgetInput) => {
  const budget = await getBudgetById(id);

  if (budget.status !== "EXPIRED") {
    throw new HttpError(409, "Only expired budgets can be reopened");
  }

  return prisma.budget.update({
    where: { id },
    data: {
      status: "PENDING",
      validUntil: input.validUntil ?? getDefaultValidUntil(),
      acceptedAt: null,
      rejectedAt: null,
    },
    select: budgetSelect,
  });
};

export const convertBudgetToWorkOrder = async (
  id: string,
  input: ConvertBudgetInput,
) => {
  await expireOverdueBudgets();

  return prisma.$transaction(async (tx) => {
    const budget = await tx.budget.findUnique({
      where: { id },
      include: { items: true, workOrder: { select: { id: true } } },
    });

    if (!budget) {
      throw new HttpError(404, "Budget not found");
    }

    if (budget.workOrder || budget.status === "CONVERTED") {
      throw new HttpError(409, "Budget already converted");
    }

    if (budget.status === "REJECTED" || budget.status === "EXPIRED") {
      throw new HttpError(
        409,
        "Only pending or accepted budgets can be converted",
      );
    }

    const now = new Date();
    const workOrder = await tx.workOrder.create({
      data: {
        customerId: budget.customerId,
        vehicleId: budget.vehicleId,
        budgetId: budget.id,
        diagnosis: budget.diagnosis,
        notes: input.notes ?? budget.notes,
        advanceAmount: money(input.advanceAmount ?? 0),
        totalSaleAmount: budget.totalSaleAmount,
        totalCostAmount: budget.totalCostAmount,
        grossProfitAmount: budget.estimatedProfitAmount,
        items: {
          create: budget.items.map((item) => ({
            type: item.type,
            description: item.description,
            saleAmount: item.saleAmount,
            costAmount: item.costAmount,
            notes: item.notes,
          })),
        },
      },
      select: {
        id: true,
        folio: true,
      },
    });

    await tx.budget.update({
      where: { id },
      data: {
        status: "CONVERTED",
        acceptedAt: budget.acceptedAt ?? now,
        convertedAt: now,
      },
    });

    return tx.workOrder.findUniqueOrThrow({
      where: { id: workOrder.id },
      select: {
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
        items: true,
      },
    });
  });
};
