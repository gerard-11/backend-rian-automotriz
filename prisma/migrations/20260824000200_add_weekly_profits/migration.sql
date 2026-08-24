-- CreateTable
CREATE TABLE "WeeklyProfit" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "grossProfitAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "expenseAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netProfitAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "workOrderCount" INTEGER NOT NULL DEFAULT 0,
    "expenseCount" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyProfit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyProfit_weekStart_key" ON "WeeklyProfit"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklyProfit_weekEnd_idx" ON "WeeklyProfit"("weekEnd");

-- CreateIndex
CREATE INDEX "WeeklyProfit_closedAt_idx" ON "WeeklyProfit"("closedAt");
