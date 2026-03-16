import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
  sanitizeInput,
} from "@/lib/api";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    let { name, email, password } = body;

    // Sanitize
    name = sanitizeInput(String(name || ""));
    email = sanitizeInput(String(email || "").toLowerCase());
    password = String(password || "");

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email address", 400);
    }

    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters", 400);
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return errorResponse(
        "Password must contain uppercase, lowercase, and a number",
        400,
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    const user = await User.create({ name, email, password });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      201,
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
