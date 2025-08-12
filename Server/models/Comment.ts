import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "story",
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "account",
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("comment", commentSchema);
