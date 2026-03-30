import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        language: {
            type: String,
            default: "javascript",
        },
        content: {
            type: String,
            default: "",
        },
        version: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Code", CodeSchema)