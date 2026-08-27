import type { RequestHandler } from "express";
import {
  createQuickWorkOrderSchema,
  listWorkOrdersQuerySchema,
  updateWorkOrderSchema,
  workOrderIdParamsSchema,
} from "./work-orders.schemas.js";
import {
  cancelWorkOrder,
  completeWorkOrder,
  createQuickWorkOrder,
  deleteCancelledWorkOrder,
  getWorkOrderById,
  listWorkOrders,
  updateWorkOrder,
} from "./work-orders.service.js";

export const createQuickEntry: RequestHandler = async (req, res) => {
  const input = createQuickWorkOrderSchema.parse(req.body);
  const workOrder = await createQuickWorkOrder(input);

  res.status(201).json({ workOrder });
};

export const list: RequestHandler = async (req, res) => {
  const query = listWorkOrdersQuerySchema.parse(req.query);
  const workOrders = await listWorkOrders(query);

  res.json({ workOrders });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const workOrder = await getWorkOrderById(id);

  res.json({ workOrder });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const input = updateWorkOrderSchema.parse(req.body);
  const workOrder = await updateWorkOrder(id, input);

  res.json({ workOrder });
};

export const complete: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const workOrder = await completeWorkOrder(id);

  res.json({ workOrder });
};

export const cancel: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const workOrder = await cancelWorkOrder(id);

  res.json({ workOrder });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  await deleteCancelledWorkOrder(id);

  res.sendStatus(204);
};
