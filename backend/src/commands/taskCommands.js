import mongoose from "mongoose";
import Task from "../models/Task.js";
import { HttpError } from "../errors.js";

export async function createTask({ title, description } = {}) {
  if (typeof title !== "string" || !title.trim()) {
    throw new HttpError(400, "Title must not be empty or whitespace.");
  }
  if (description !== undefined && typeof description !== "string") {
    throw new HttpError(400, "Description must be a string.");
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() ?? "",
    isCompleted: false,
  });

  return { id: task.id };
}

export async function completeTask(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Task not found.");
  }

  const updated = await Task.findOneAndUpdate(
    { _id: id, isCompleted: false },
    { $set: { isCompleted: true } },
    { new: true },
  ).lean();

  if (updated) {
    return { id: updated._id.toString(), isCompleted: true };
  }

  const exists = await Task.exists({ _id: id });
  if (!exists) {
    throw new HttpError(404, "Task not found.");
  }
  throw new HttpError(409, "Task is already completed.");
}
