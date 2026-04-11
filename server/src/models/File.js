import mongoose from "mongoose";
import Room from "./Room.js";

const FileSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            index: true,
        },
        fileName: {
            type: String,
            required: true,
            trim: true,
        },
        fileType: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            default: "",
        },
        binaryState: {
            type: Buffer,
            default: null,
        },
        modified: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

// HOOK: Auto-add to Room.files on creation
FileSchema.post("save", async function(doc, next) {
    try {
        await Room.findOneAndUpdate(
            { roomId: doc.roomId },
            { $addToSet: { files: doc._id } }
        );
    } catch (err) {
        console.error("Hook error (File post-save):", err);
    }
    next();
});

// HOOK: Auto-remove from Room.files on deletion
FileSchema.post("findOneAndDelete", async function(doc, next) {
    if (doc) {
        try {
            await Room.findOneAndUpdate(
                { roomId: doc.roomId },
                { $pull: { files: doc._id } }
            );
        } catch (err) {
            console.error("Hook error (File post-findOneAndDelete):", err);
        }
    }
    next();
});

export default mongoose.model("File", FileSchema);