import { prisma } from "../../db/prisma.js";
import type {
  CloseWeeklyProfitInput,
  ListWeeklyProfitsQuery,
  WeeklyProfitQuery,
} from "./profits.schemas.js";

const weeklyProfitSelect = {
  id: true,
  weekStart: true,
  weekEnd: true,
  grossProfitAmount: true,
  expenseAmount: true,
  netProfitAmount: true,
  workOrderCount: true,
  expenseCount: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const money = (value: number) => value.toFixed(2);

const decimalToNumber = (value: unknown) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(String(value));
};

const getWeekBounds = (date = new Date()) => {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);

  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  return {
    weekStart,
    nextWeekStart,
    weekEnd: new Date(nextWeekStart.getTime() - 1),
  };
};

export const calculateWeeklyProfit = async (query: WeeklyProfitQuery) => {
  const { weekStart, weekEnd, nextWeekStart } = getWeekBounds(query.weekStart);

  const [workOrders, expenses] = await prisma.$transaction([
    prisma.workOrder.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: weekStart,
          lt: nextWeekStart,
        },
      },
      _sum: { grossProfitAmount: true },
      _count: { _all: true },
    }),
    prisma.expense.aggregate({
      where: {
        spentAt: {
          gte: weekStart,
          lt: nextWeekStart,
        },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const grossProfitAmount = decimalToNumber(workOrders._sum.grossProfitAmount);
  const expenseAmount = decimalToNumber(expenses._sum.amount);

  return {
    weekStart,
    weekEnd,
    grossProfitAmount: money(grossProfitAmount),
    expenseAmount: money(expenseAmount),
    netProfitAmount: money(grossProfitAmount - expenseAmount),
    workOrderCount: workOrders._count._all,
    expenseCount: expenses._count._all,
  };
};

export const closeWeeklyProfit = async (input: CloseWeeklyProfitInput) => {
  const weeklyProfit = await calculateWeeklyProfit({
    weekStart: input.weekStart,
  });

  return prisma.weeklyProfit.upsert({
    where: { weekStart: weeklyProfit.weekStart },
    update: {
      weekEnd: weeklyProfit.weekEnd,
      grossProfitAmount: weeklyProfit.grossProfitAmount,
      expenseAmount: weeklyProfit.expenseAmount,
      netProfitAmount: weeklyProfit.netProfitAmount,
      workOrderCount: weeklyProfit.workOrderCount,
      expenseCount: weeklyProfit.expenseCount,
      closedAt: new Date(),
    },
    create: weeklyProfit,
    select: weeklyProfitSelect,
  });
};

export const listWeeklyProfits = (query: ListWeeklyProfitsQuery) => {
  return prisma.weeklyProfit.findMany({
    where: {
      weekStart:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom,
              lte: query.dateTo,
            }
          : undefined,
    },
    select: weeklyProfitSelect,
    orderBy: { weekStart: "desc" },
    take: 100,
  });
};
