import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "1d";

/** Sign an access token for an authenticated user. */
export const generateToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

/** Verify and decode an access token. Throws if invalid/expired. */
export const verifyToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};
