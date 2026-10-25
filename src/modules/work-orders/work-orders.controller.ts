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
  presentWorkOrderForEmployee,
  updateWorkOrder,
} from "./work-orders.service.js";

const presentForRole = <T extends Parameters<typeof presentWorkOrderForEmployee>[0]>(
  workOrder: T,
  role: "ADMIN" | "EMPLOYEE",
) => (role === "ADMIN" ? workOrder : presentWorkOrderForEmployee(workOrder));

export const createQuickEntry: RequestHandler = async (req, res) => {
  const input = createQuickWorkOrderSchema.parse(req.body);
  const workOrder = await createQuickWorkOrder(input, req.user!.name);

  res.status(201).json({
    workOrder: presentForRole(workOrder, req.user!.role),
  });
};

export const list: RequestHandler = async (req, res) => {
  const query = listWorkOrdersQuerySchema.parse(req.query);
  const workOrders = await listWorkOrders(query, req.user!.role);

  res.json({
    workOrders: workOrders.map((workOrder) =>
      presentForRole(workOrder, req.user!.role),
    ),
  });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const workOrder = await getWorkOrderById(id, req.user!.role);

  res.json({ workOrder: presentForRole(workOrder, req.user!.role) });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const input = updateWorkOrderSchema.parse(req.body);
  const workOrder = await updateWorkOrder(id, input);

  res.json({ workOrder: presentForRole(workOrder, req.user!.role) });
};

export const complete: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const workOrder = await completeWorkOrder(id);

  res.json({ workOrder: presentForRole(workOrder, req.user!.role) });
};

export const cancel: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  const workOrder = await cancelWorkOrder(id);

  res.json({ workOrder: presentForRole(workOrder, req.user!.role) });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = workOrderIdParamsSchema.parse(req.params);
  await deleteCancelledWorkOrder(id);

  res.sendStatus(204);
};
