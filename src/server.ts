import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log("API running on http://localhost:" + env.PORT);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(signal + " received, shutting down");
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

