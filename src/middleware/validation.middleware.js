import AppError from "../utils/error/appError.js";

/**
 * validate — a Joi validation middleware factory.
 * Pass a schema describing which request parts to check.
 * Usage: router.post("/register", validate(registerSchema), handler)
 */
export const validate = (schema) => {
  return (req, _res, next) => {
    const toCheck = {};
    if (schema.body) toCheck.body = req.body;
    if (schema.params) toCheck.params = req.params;
    if (schema.query) toCheck.query = req.query;

    const errors = [];
    for (const key of Object.keys(toCheck)) {
      const { error } = schema[key].validate(toCheck[key], {
        abortEarly: false,
      });
      if (error) {
        errors.push(...error.details.map((d) => d.message));
      }
    }

    if (errors.length) {
      return next(AppError.badRequest(errors.join(", ")));
    }
    next();
  };
};
