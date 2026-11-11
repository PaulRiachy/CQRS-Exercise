import mongoose from "mongoose";
import Task from "../models/Task.js";
import { HttpError } from "../errors.js";

function toTaskResponse(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    isCompleted: task.isCompleted,
    createdAt: task.createdAt,
  };
}

export async function getTask(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Task not found.");
  }

  const task = await Task.findById(id).lean();
  if (!task) {
    throw new HttpError(404, "Task not found.");
  }
  return toTaskResponse(task);
}

export async function listTasks(isCompleted) {
  const filter = {};
  if (isCompleted !== undefined) {
    if (isCompleted !== "true" && isCompleted !== "false") {
      throw new HttpError(400, "isCompleted must be true or false.");
    }
    filter.isCompleted = isCompleted === "true";
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1, _id: -1 }).lean();
  return tasks.map(toTaskResponse);
}
