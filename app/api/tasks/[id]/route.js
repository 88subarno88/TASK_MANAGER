import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, sanitizeInput } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const task = await prisma.task.findFirst({ where: { id, userId: user.userId } });
    if (!task) return errorResponse('Not found', 404);

    return successResponse({ ...task, _id: task.id });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request, { params }) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const task = await prisma.task.findFirst({ where: { id, userId: user.userId } });
    if (!task) return errorResponse('Not found', 404);

    const body = await request.json();
    const updateData = {};
    
    if (body.title) updateData.title = sanitizeInput(String(body.title));
    if (body.description !== undefined) updateData.description = body.description ? sanitizeInput(String(body.description)) : null;
    if (body.status) {
        updateData.status = body.status;
        if (body.status === 'done' && task.status !== 'done') updateData.completedAt = new Date();
        if (body.status !== 'done') updateData.completedAt = null;
    }
    if (body.priority) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.tags) updateData.tags = body.tags;
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);

    const updated = await prisma.task.update({ where: { id }, data: updateData });
    return successResponse({ ...updated, _id: updated.id });
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request, { params }) {
  try {
    const user = requireAuth(request);
    const { id } = await params;
    
    const task = await prisma.task.findFirst({ where: { id, userId: user.userId } });
    if (!task) return errorResponse('Not found', 404);

    await prisma.task.delete({ where: { id } });
    return successResponse({ message: 'Deleted', id });
  } catch (error) { return handleApiError(error); }
}
