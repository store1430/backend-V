export function attachSignaling(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, role }) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      const existingPeerCount = room?.size || 0;

      socket.join(roomId);
      socket.to(roomId).emit("peer-joined", { socketId: socket.id, role });

      if (existingPeerCount > 0) {
        socket.emit("peer-joined", { socketId: socket.id, role: "existing-peer" });
      }
    });

    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", { offer });
    });

    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", { answer });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", { candidate });
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("peer-left");
    });
  });
}
