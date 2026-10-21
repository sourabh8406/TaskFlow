import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import { toClient } from "../utils/toClient.js";

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.create({ username, email, password });
  res
    .status(201)
    .json({ message: "User registered successfully", user: toClient(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError("Invalid email or password", 401);
  }
  const token = signToken(user._id);
  const safeUser = toClient(user);
  res.status(200).json({ success: true, data: { token, user: safeUser } });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  res.status(200).json({ success: true, data: toClient(user) });
});

module.exports = { register, login, me };
