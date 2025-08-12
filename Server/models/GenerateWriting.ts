import mongoose from "mongoose";

const generateWritingSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  idAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: true,
    unique: true,
  },
  suggest: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("generateWriting", generateWritingSchema);
