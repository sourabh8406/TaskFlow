import jwt from "jsonwebtoken";
import User from "../models/User";
import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication required");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "Invalid or expired token");
  }

  req.user = { id: user.id, email: user.email, name: user.name };
  next();
});

module.exports = authMiddleware;
