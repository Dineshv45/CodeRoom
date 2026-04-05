import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    activeFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per user/room
WorkspaceSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.model("Workspace", WorkspaceSchema);
