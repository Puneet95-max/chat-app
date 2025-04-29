import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { verify } from "jsonwebtoken";

export async function POST(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = verify(token, process.env.JWT_SECRET);
  const { receiverId, text } = await req.json();

  if (!receiverId || !text) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const message = await Message.create({
    sender: decoded.id,
    receiver: receiverId,
    text,
  });

  return NextResponse.json({ success: true, message });
}
