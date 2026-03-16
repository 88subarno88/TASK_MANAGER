import connectDB from '@/lib/db';
import Task, { TASK_STATUSES, TASK_PRIORITIES } from '@/models/Task';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, sanitizeInput } from '@/lib/api';
import mongoose from 'mongoose';

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  try {
    const user = requireAuth(request);
    await connectDB();
    if (!isValidObjectId(params.id)) return errorResponse('Invalid task ID', 400);
    const task = await Task.findOne({ _id: params.id, user: user.userId });
    if (!task) return errorResponse('Task not found', 404);
    return successResponse(task.toJSON());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = requireAuth(request);
    await connectDB();
    if (!isValidObjectId(params.id)) return errorResponse('Invalid task ID', 400);
    const task = await Task.findOne({ _id: params.id, user: user.userId });
    if (!task) return errorResponse('Task not found', 404);

    const body = await request.json();
    let { title, description, status, priority, dueDate, tags, isArchived } = body;

    const updateData = {};
    if (title !== undefined) {
      title = sanitizeInput(String(title));
      if (!title) return errorResponse('Title cannot be empty', 400);
      updateData.title = title;
    }
    if (description !== undefined) updateData.description = description ? sanitizeInput(String(description)) : null;
    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) return errorResponse('Invalid status', 400);
      updateData.status = status;
      if (status === 'done' && task.status !== 'done') updateData.completedAt = new Date();
      if (status !== 'done') updateData.completedAt = null;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (tags !== undefined) updateData.tags = tags.map(t => sanitizeInput(String(t)).substring(0, 30));
    if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

    const updated = await Task.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true });
    return successResponse(updated.toJSON());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = requireAuth(request);
    await connectDB();
    if (!isValidObjectId(params.id)) return errorResponse('Invalid task ID', 400);
    const task = await Task.findOneAndDelete({ _id: params.id, user: user.userId });
    if (!task) return errorResponse('Task not found', 404);
    return successResponse({ message: 'Task deleted successfully', id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
