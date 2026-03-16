import { clearAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = successResponse({ message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
