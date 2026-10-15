import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import bootstrap from "./src/app.controller.js";
import { closeCache } from "./src/utils/cache/cache.js";
import logger from "./src/utils/logger/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

bootstrap(app, express);

const server = app.listen(PORT, () => {
  logger.info(`Whisperly server is running on http://localhost:${PORT}`);
});

/**
 * Graceful shutdown: on SIGINT/SIGTERM, stop accepting new connections and
 * close the database and cache cleanly before exiting. This avoids dropped
 * requests and leaked connections when the process is stopped or redeployed.
 */
const shutdown = async (signal) => {
  logger.warn(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      await closeCache();
      logger.info("All connections closed. Bye 👋");
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  });

  // Force-exit if something hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
};

["SIGINT", "SIGTERM"].forEach((signal) =>
  process.on(signal, () => shutdown(signal))
);

// Catch truly unexpected errors so the logger records them.
process.on("unhandledRejection", (reason) =>
  logger.error(`Unhandled Rejection: ${reason}`)
);
process.on("uncaughtException", (error) =>
  logger.error(`Uncaught Exception: ${error.message}`)
);
