const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const MAX_PLAYERS = 4;
const PORT = 3000;

// Serve static files
app.use(express.static("public"));

// In-memory room storage
// rooms = {
//   ABCD: { players: [socketId, socketId] }
// }
const rooms = {};

// Generate 4-letter room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // CREATE ROOM
  socket.on("create-room", () => {
    let roomCode;

    do {
      roomCode = generateRoomCode();
    } while (rooms[roomCode]);

    rooms[roomCode] = { players: [] };
    socket.emit("room-created", roomCode);

    socket.emit("room-created", roomCode);
    io.to(roomCode).emit("player-count", rooms[roomCode].players.length);

    console.log(`Room ${roomCode} created`);
  });

  socket.on("controller-input", (data) => {
    socket.to(data.room).emit("controller-input", data);
  });


  // JOIN ROOM
  socket.on("join-room", ({ roomCode, role }) => {
    roomCode = roomCode.toUpperCase();
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("error-message", "Room does not exist");
      return;
    }

    // HOST JOIN (does NOT count)
    if (role === "host") {
      socket.join(roomCode);
      console.log(`Host joined room ${roomCode}`);
      return;
    }

    // CONTROLLER JOIN (counts)
    if (room.players.length >= MAX_PLAYERS) {
      socket.emit("error-message", "Room is full (max 4 players)");
      return;
    }

    socket.join(roomCode);
    room.players.push(socket.id);
    socket.emit("player-accepted");
    io.to(roomCode).emit("player-count", room.players.length);
    console.log(`Controller joined ${roomCode} (${room.players.length}/4)`);
  });


  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const index = room.players.indexOf(socket.id);

      if (index !== -1) {
        room.players.splice(index, 1);
        io.to(roomCode).emit("player-count", room.players.length);

        if (room.players.length === 0) {
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted`);
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Cloud Console server running at http://localhost:${PORT}`);
});
