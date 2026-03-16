import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, sanitizeInput } from '@/lib/api';

const TASK_STATUSES = ['todo', 'in-progress', 'done'];

export async function GET(request) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    const where = { userId: user.userId, isArchived: false };
    if (status && TASK_STATUSES.includes(status)) where.status = status;

    const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
    const filteredTasks = search ? tasks.filter(t => t.title?.toLowerCase().includes(search)) : tasks;
    
    // Map id to _id so frontend doesn't break
    const formattedTasks = filteredTasks.map(t => ({ ...t, _id: t.id }));
    
    return successResponse(formattedTasks, 200, { pagination: { total: formattedTasks.length } });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    let { title, description, status, priority, dueDate, tags } = body;
    
    title = sanitizeInput(String(title || ''));
    if (!title) return errorResponse('Title required', 400);

    const task = await prisma.task.create({
      data: {
        title, 
        description: description ? sanitizeInput(String(description)) : null,
        status: status || 'todo', 
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null, 
        tags: tags || [], 
        userId: user.userId
      }
    });
    return successResponse({ ...task, _id: task.id }, 201);
  } catch (error) { return handleApiError(error); }
}
