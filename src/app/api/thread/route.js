
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Thread from "@/models/Thread";
import { verify } from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verify(token, process.env.JWT_SECRET);
  const { name } = await req.json();

  const thread = await Thread.create({
    name,
    participants: [decoded.id],
  });

  return NextResponse.json({ success: true, thread });
}

export async function GET(req) {
  await connectDB();
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verify(token, process.env.JWT_SECRET);

  const threads = await Thread.find({ participants: decoded.id });

  return NextResponse.json({ success: true, threads });
}
