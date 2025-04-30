import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value;
  const decoded = verify(token, process.env.JWT_SECRET);

  const users = await User.find({ _id: { $ne: decoded.id } });

  return NextResponse.json({ users });
}
