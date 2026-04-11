import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid";

const timelineSchema = new mongoose.Schema({
    recordId:{
        type:String,
        default:() => uuidv4(),
        unique:true,
        index:true,
    },
    roomId:{
        type:String,
        required:true,
        index:true,
    },
    userId:{
        type: mongoose.Schema.Types.Mixed,
        ref: "User",
        required:true,
        index:true,
    },
    label: {
        type: String, 
        required: true
    },
    records: [
        {
            fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
            fileName: String,
            fileType: String,
            content: Buffer, // The actual binary state/content of THIS file
        }
    ],
  createdAt:{
        type:Date,
        default:Date.now
    }    
    
});

export default mongoose.model("Timeline", timelineSchema);