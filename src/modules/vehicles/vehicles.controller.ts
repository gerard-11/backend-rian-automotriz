import type { RequestHandler } from "express";
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
  vehicleIdParamsSchema,
} from "./vehicles.schemas.js";
import {
  createVehicle,
  getVehicleById,
  listVehicles,
  updateVehicle,
} from "./vehicles.service.js";

export const create: RequestHandler = async (req, res) => {
  const input = createVehicleSchema.parse(req.body);
  const vehicle = await createVehicle(input);

  res.status(201).json({ vehicle });
};

export const list: RequestHandler = async (req, res) => {
  const query = listVehiclesQuerySchema.parse(req.query);
  const vehicles = await listVehicles(query);

  res.json({ vehicles });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = vehicleIdParamsSchema.parse(req.params);
  const vehicle = await getVehicleById(id);

  res.json({ vehicle });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = vehicleIdParamsSchema.parse(req.params);
  const input = updateVehicleSchema.parse(req.body);
  const vehicle = await updateVehicle(id, input);

  res.json({ vehicle });
};
