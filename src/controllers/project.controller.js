import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toClient, toClientList } from "../utils/toCilent.js";

const create = asyncHandler(async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description || "",
    userId: req.user.id,
  });
  res.status(201).json({ success: true, data: toClient(project) });
});

const list = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user.id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: toClientList(projects) });
});

const getOne = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });
  if (!project) throw new ApiError(404, "Project not found");
  res.status(200).json({ success: true, data: toClient(project) });
});

const update = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });
  if (!project) throw new ApiError(404, "Project not found");

  if (req.body.name !== undefined) project.name = req.body.name;
  if (req.body.description !== undefined)
    project.description = req.body.description;
  await project.save();

  res.status(200).json({ success: true, data: toClient(project) });
});

const remove = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });
  if (!project) throw new ApiError(404, "Project not found");

  const remainingTasks = await Task.countDocuments({
    project: project.id,
    owner: req.user.id,
  });
  if (remainingTasks > 0) {
    throw new ApiError(409, "Cannot delete project while tasks remain");
  }

  await project.deleteOne();
  res.status(204).send();
});

module.exports = { create, list, getOne, update, remove };
