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
    let { email, password } = body;

    email = sanitizeInput(String(email || "").toLowerCase());
    password = String(password || "");

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const user = await User.findOne({ email, isActive: true }).select(
      "+password",
    );
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: new Date(),
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
