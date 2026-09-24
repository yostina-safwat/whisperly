import AppError from "./appError.js";
import logger from "../logger/logger.js";

/**
 * asyncHandler — wraps an async route handler so any rejected promise
 * is forwarded to Express's error pipeline instead of crashing the app.
 * (No more repetitive try/catch in every controller.)
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
};

/** 404 handler for any unmatched route. */
export const notFoundHandler = (req, _res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Central error handler — the single place that shapes error responses. */
export const globalErrorHandler = (err, _req, res, _next) => {
  let error = err;

  // Normalise a few common non-AppError errors into AppError.
  if (error?.name === "ValidationError") {
    error = AppError.badRequest(error.message);
  } else if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    error = AppError.conflict(`${field} already exists`);
  } else if (error?.name === "JsonWebTokenError") {
    error = AppError.unauthorized("Invalid token");
  } else if (error?.name === "TokenExpiredError") {
    error = AppError.unauthorized("Token expired, please login again");
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  if (statusCode >= 500) {
    logger.error(`${error.message}\n${error.stack || ""}`);
  } else {
    logger.warn(`${statusCode} - ${error.message}`);
  }

  res.status(statusCode).json({
    success: false,
    status,
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
