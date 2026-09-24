import User from "../DB/models/user.model.js";
import AppError from "../utils/error/appError.js";
import { verifyToken } from "../utils/security/token.js";
import { asyncHandler } from "../utils/error/errorHandler.js";

/**
 * Protect routes: require a valid Bearer access token and load the user.
 * Usage: router.get("/profile", authenticate, handler)
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized("Authorization header (Bearer token) is required");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token); // throws -> handled globally

  const user = await User.findById(decoded.id);
  if (!user) {
    throw AppError.unauthorized("User no longer exists");
  }
  if (!user.isConfirmed) {
    throw AppError.forbidden("Please confirm your account first");
  }

  req.user = user;
  next();
});

/**
 * Restrict a route to specific roles.
 * Usage: router.delete("/:id", authenticate, authorize("admin"), handler)
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(AppError.forbidden("You do not have permission for this action"));
    }
    next();
  };
};
