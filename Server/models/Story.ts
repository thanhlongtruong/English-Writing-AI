import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  content_vi: {
    type: String,
  },
  content_en: {
    type: String,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("story", storySchema);
