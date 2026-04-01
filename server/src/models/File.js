import mongoose from "mongoose";

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
    },
    {timestamps: true}
);

export default mongoose.model("File", FileSchema);