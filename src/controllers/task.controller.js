import Task from "../models/Task";
import Project from "../models/Project";
import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import { toClient, toClientList } from "../utils/toClient";

async function assertOwnProject(projectId, ownerId) {
  if (projectId === undefined) return undefined;
  if (projectId === null || projectId === "") return null;

  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) throw new ApiError(404, "Project not found");
  return project.id;
}

const create = asyncHandler(async (req, res) => {
  const project = await assertOwnProject(req.body.project, req.user.id);

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate || null,
    project: project === undefined ? null : project,
    owner: req.user.id,
  });

  res.status(201).json({ success: true, data: toClient(task) });
});

const list = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    projectId,
    search,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const filter = { owner: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (projectId) filter.project = projectId;
  if (search) filter.title = { $regex: search, $options: "i" };

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: toClientList(tasks),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
  if (!task) throw new ApiError(404, "Task not found");
  res.status(200).json({ success: true, data: toClient(task) });
});

const update = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
  if (!task) throw new ApiError(404, "Task not found");

  if (req.body.project !== undefined) {
    task.project = await assertOwnProject(req.body.project, req.user.id);
  }
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.description !== undefined)
    task.description = req.body.description;
  if (req.body.status !== undefined) task.status = req.body.status;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  if (req.body.dueDate !== undefined) {
    task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
  }

  await task.save();
  res.status(200).json({ success: true, data: toClient(task) });
});

const remove = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
  if (!task) throw new ApiError(404, "Task not found");
  await task.deleteOne();
  res.status(204).send();
});

module.exports = { create, list, getOne, update, remove };
