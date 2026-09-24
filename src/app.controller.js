import cors from "cors";
import connectDB from "./DB/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import messageRouter from "./modules/message/message.controller.js";
import { globalErrorHandler, notFoundHandler } from "./utils/error/errorHandler.js";
import logger from "./utils/logger/logger.js";

/**
 * Application bootstrap.
 * Wires middleware, routes and the global error handling layer.
 */
const bootstrap = (app, express) => {
  // Connect to the database
  connectDB();

  // Global middleware
  app.use(cors());
  app.use(express.json());

  // Simple request logger
  app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.originalUrl}`);
    next();
  });

  // Health check / welcome
  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Whisperly API — send anonymous whispers 🤫",
    });
  });

  // Feature routes
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  // 404 + global error handler (must be last)
  app.use(notFoundHandler);
  app.use(globalErrorHandler);
};

export default bootstrap;
