import prisma from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, sanitizeInput } from '@/lib/api';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    let { email, password } = body;
    email = sanitizeInput(String(email || '').toLowerCase());

    if (!email || !password) return errorResponse('Missing fields', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse('Invalid credentials', 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return errorResponse('Invalid credentials', 401);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = successResponse({ user: { id: user.id, _id: user.id, name: user.name, email: user.email } });
    setAuthCookie(response, token);
    return response;
  } catch (error) { return handleApiError(error); }
}
