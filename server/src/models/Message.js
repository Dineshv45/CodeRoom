import mongoose, { mongo } from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        roomId:{
            type:String,
            required:true,
            index:true,
        },

        sender: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        username:{
            type:String,
            required:true,
        },

        text:{
            type:String,
            required:true,
        },   
          
    },
    {timestamps:true}
);
export default mongoose.model("Message", MessageSchema);