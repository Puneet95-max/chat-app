import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req) {
  await connectDB();
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
