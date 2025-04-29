import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { verify } from "jsonwebtoken";
import { Types } from "mongoose";

export async function GET(req, { params }) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = verify(token, process.env.JWT_SECRET);
  const { userId } = params;

  const messages = await Message.find({
    $or: [
      { sender: decoded.id, receiver: userId },
      { sender: userId, receiver: decoded.id },
    ],
  }).sort({ createdAt: 1 }); // oldest first

  const formatted = messages.map((msg) => ({
    _id: msg._id,
    text: msg.text,
    isSender: msg.sender.toString() === decoded.id,
  }));

  return NextResponse.json({ success: true, messages: formatted });
}
