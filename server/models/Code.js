import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema(
    {
        roomId:{
            type:String,
            required:true,
            unique:true,
        },
        language:{
            type:String,
            default:"javascript",
        },
        content:{
            type:String,
            default:"",
        },
    },
    {timestamps:true}
);

export default mongoose.model("code", CodeSchema)