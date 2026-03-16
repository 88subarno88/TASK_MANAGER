import prisma from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError, sanitizeInput } from '@/lib/api';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    let { name, email, password } = body;
    name = sanitizeInput(String(name || ''));
    email = sanitizeInput(String(email || '').toLowerCase());
    password = String(password || '');

    if (!name || !email || !password) return errorResponse('Missing fields', 400);
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return errorResponse('Account already exists', 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ 
      data: { name, email, password: hashedPassword } 
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = successResponse({ user: { id: user.id, _id: user.id, name: user.name, email: user.email } }, 201);
    setAuthCookie(response, token);
    return response;
  } catch (error) { return handleApiError(error); }
}
