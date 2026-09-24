/**
 * AppError — a custom, operational error class.
 *
 * Demonstrates OOP: it extends the built-in `Error` class (inheritance)
 * and adds an HTTP status code plus an `isOperational` flag so the global
 * handler can distinguish expected errors (bad input, not found, ...) from
 * unexpected programming bugs.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message); // call the parent Error constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Keep a clean stack trace pointing to where the error was created.
    Error.captureStackTrace(this, this.constructor);
  }

  // Handy named factory methods for the most common cases.
  static badRequest(message = "Bad request") {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }
}

export default AppError;
