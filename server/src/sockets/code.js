import Code from "../models/Code.js";

export default function codeSocket(io, socket){
    socket.on("CODE_CHANGE", async({roomId, code}) =>{
        await Code.findOneUpdate(
            {roomId},
            {content:code},
            {upsert:true},
        );

        socket.to(roomId).emit("CODE_CHANGE", {code});
    });
}