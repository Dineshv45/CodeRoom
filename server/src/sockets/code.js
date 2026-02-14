import Code from "../models/Code.js";

export default function codeSocket(io, socket) {

  socket.on("CODE_SYNC", async({roomId})=>{
    const existingCode = await Code.findOne({roomId});

    socket.emit("CODE_CHANGE", {
      code : existingCode?.content || "Code here...",
    });
  });

  
  socket.on("CODE_CHANGE", async ({ roomId, code }) => {
    await Code.findOneAndUpdate(
      { roomId },
      { content: code },
      { upsert: true }
    );

    socket.to(roomId).emit("CODE_CHANGE", { code });
  });
}