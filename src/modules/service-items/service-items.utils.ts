type ServiceItemInput = {
  saleAmount: number;
  costAmount?: number;
};

export const money = (value: number) => value.toFixed(2);

export const calculateServiceItemTotals = (items: ServiceItemInput[]) => {
  const totalSaleAmount = items.reduce((sum, item) => sum + item.saleAmount, 0);
  const totalCostAmount = items.reduce(
    (sum, item) => sum + (item.costAmount ?? 0),
    0,
  );

  return {
    totalSaleAmount: money(totalSaleAmount),
    totalCostAmount: money(totalCostAmount),
    profitAmount: money(totalSaleAmount - totalCostAmount),
  };
};
