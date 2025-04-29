import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verify } from "jsonwebtoken";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verify(token, process.env.JWT_SECRET);

  const users = await User.find({ _id: { $ne: decoded.id } }).select("name email _id");

  return NextResponse.json({ users });
}
