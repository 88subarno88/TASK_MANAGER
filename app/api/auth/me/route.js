import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api';

export async function GET(request) {
  try {
    const authUser = requireAuth(request);
    await connectDB();

    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse('User not found', 404);

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
