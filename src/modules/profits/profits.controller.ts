import type { RequestHandler } from "express";
import {
  closeWeeklyProfitSchema,
  listWeeklyProfitsQuerySchema,
  weeklyProfitQuerySchema,
} from "./profits.schemas.js";
import {
  calculateWeeklyProfit,
  closeWeeklyProfit,
  listWeeklyProfits,
} from "./profits.service.js";

export const calculateWeekly: RequestHandler = async (req, res) => {
  const query = weeklyProfitQuerySchema.parse(req.query);
  const weeklyProfit = await calculateWeeklyProfit(query);

  res.json({ weeklyProfit });
};

export const listWeeklyHistory: RequestHandler = async (req, res) => {
  const query = listWeeklyProfitsQuerySchema.parse(req.query);
  const weeklyProfits = await listWeeklyProfits(query);

  res.json({ weeklyProfits });
};

export const closeWeekly: RequestHandler = async (req, res) => {
  const input = closeWeeklyProfitSchema.parse(req.body);
  const weeklyProfit = await closeWeeklyProfit(input);

  res.status(201).json({ weeklyProfit });
};
