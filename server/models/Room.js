import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true, // this is what you already use in URL
      index: true,
    },

    roomName: {
      type: String,
      unique: true,
      sparse: true, // allows null for now
    },

    createdBy: {
      type: String, // username for now
    },

    isProtected: {
      type: Boolean,
      default: false,
    },

    passwordHash: {
      type: String, // later (Phase 2+)
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
