import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { budgetsRouter } from "./modules/budgets/budgets.routes.js";
import { customersRouter } from "./modules/customers/customers.routes.js";
import { expensesRouter } from "./modules/expenses/expenses.routes.js";
import { vehiclesRouter } from "./modules/vehicles/vehicles.routes.js";
import { workOrdersRouter } from "./modules/work-orders/work-orders.routes.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(pinoHttp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.use("/auth", authRouter);
app.use("/budgets", budgetsRouter);
app.use("/customers", customersRouter);
app.use("/expenses", expensesRouter);
app.use("/health", healthRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/work-orders", workOrdersRouter);
app.use(notFoundHandler);
app.use(errorHandler);

