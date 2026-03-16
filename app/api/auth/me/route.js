import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api';

export async function GET(request) {
  try {
    const authUser = requireAuth(request);
    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) throw new Error('User not found');
    return successResponse({ user: { id: user.id, _id: user.id, name: user.name, email: user.email } });
  } catch (error) { return handleApiError(error); }
}
