import type { RequestHandler } from "express";
import {
  createCustomerSchema,
  customerIdParamsSchema,
  listCustomersQuerySchema,
  updateCustomerSchema,
} from "./customers.schemas.js";
import {
  createCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customers.service.js";

export const create: RequestHandler = async (req, res) => {
  const input = createCustomerSchema.parse(req.body);
  const customer = await createCustomer(input);

  res.status(201).json({ customer });
};

export const list: RequestHandler = async (req, res) => {
  const query = listCustomersQuerySchema.parse(req.query);
  const customers = await listCustomers(query);

  res.json({ customers });
};

export const getById: RequestHandler = async (req, res) => {
  const { id } = customerIdParamsSchema.parse(req.params);
  const customer = await getCustomerById(id);

  res.json({ customer });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = customerIdParamsSchema.parse(req.params);
  const input = updateCustomerSchema.parse(req.body);
  const customer = await updateCustomer(id, input);

  res.json({ customer });
};
