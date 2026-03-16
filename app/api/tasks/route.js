import connectDB from '@/lib/db';
import Task, { TASK_STATUSES } from '@/models/Task';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, sanitizeInput, getPaginationParams } from '@/lib/api';

export async function GET(request) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const query = {
      user: user.userId,
      isArchived: { $ne: true },
    };

    const status = searchParams.get('status');
    if (status && TASK_STATUSES.includes(status)) query.status = status;

    const priority = searchParams.get('priority');
    if (priority) query.priority = priority;

    const sortField = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') === 'asc' ? 1 : -1;
    const allowedSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'status'];
    const sort = { [allowedSortFields.includes(sortField) ? sortField : 'createdAt']: sortDir };

    const [tasks, total] = await Promise.all([
      Task.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Task.countDocuments(query),
    ]);

    // Search filter
    const search = searchParams.get('search')?.toLowerCase();
    const filteredTasks = search
      ? tasks.filter(t => t.title?.toLowerCase().includes(search))
      : tasks;

    return successResponse(filteredTasks, 200, {
      pagination: {
        page,
        limit,
        total: search ? filteredTasks.length : total,
        totalPages: Math.ceil((search ? filteredTasks.length : total) / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const body = await request.json();
    let { title, description, status, priority, dueDate, tags } = body;

    title = sanitizeInput(String(title || ''));
    description = description ? sanitizeInput(String(description)) : null;

    if (!title || title.trim().length === 0) {
      return errorResponse('Task title is required', 400);
    }
    if (title.length > 200) {
      return errorResponse('Title cannot exceed 200 characters', 400);
    }
    if (status && !TASK_STATUSES.includes(status)) {
      return errorResponse(`Status must be one of: ${TASK_STATUSES.join(', ')}`, 400);
    }

    const task = await Task.create({
      user: user.userId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags?.map(t => sanitizeInput(String(t)).substring(0, 30)) || [],
    });

    return successResponse(task.toJSON(), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
