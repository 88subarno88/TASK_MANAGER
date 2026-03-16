import { NextResponse } from 'next/server';

export function GET() {
  const response = NextResponse.redirect('http://localhost:3000/login');
  response.cookies.set('tm_session', '', {
    expires: new Date(0),
    path: '/',
  });
  return response;
}