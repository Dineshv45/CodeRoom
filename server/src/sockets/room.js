const onlineUsers = new Map();

export default function roomSocket(io, socket) {
    socket.on("ROOM_JOIN", ({roomId}) =>{
        socket.join(roomId);
    

        onlineUsers.set(socket.id, {
            userId: socket.user.userId,
            username: socket.user.username,
        });

        io.to(roomId).emit("USER_ONLINE", {
            userId:socket.user.userId,
            username:socket.user.username,
        }); 
    });
    
    io.on("ROOM_LEAVE", ({roomId}) => {
        socket.leave(roomId);
        onlineUsers.delete(socket.id);
        
        socket.io(roomId).emit("USER_OFFLINE", {
            userId:socket.user.userId,
        });
    });


    socket.on("disconnect", ()=>{
        onlineUsers.delete(socket.id);
    });
}