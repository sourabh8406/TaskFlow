import mongoose from "mongoose";
import Task from "../models/Task";
import asyncHandler from "../utils/asyncHandler";

const taskStats = asyncHandler(async (req, res) => {
  const owner = new mongoose.Types.ObjectId(req.user.id);

  const [result] = await Task.aggregate([
    { $match: { owner } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $ne: ["$status", "done"] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: result?.total || 0,
      completed: result?.completed || 0,
      pending: result?.pending || 0,
      priority: {
        low: result?.low || 0,
        medium: result?.medium || 0,
        high: result?.high || 0,
      },
    },
  });
});

module.exports = { taskStats };
