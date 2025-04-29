import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const Thread = mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);

export default Thread;
