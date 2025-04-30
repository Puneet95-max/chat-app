import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.id;
    const otherUserId = params.userId;

    // Validate ObjectIDs
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Find messages
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .lean(); // Convert to plain JS objects

    // Format response
    const formatted = messages.map(msg => ({
      _id: msg._id.toString(),
      text: msg.text,
      isSender: msg.sender.toString() === currentUserId,
      createdAt: msg.createdAt
    }));

    return NextResponse.json(
      { success: true, messages: formatted },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load messages" },
      { status: 500 }
    );
  }
}