const socket = io();

const statusEl = document.getElementById("status");
const buttons = document.querySelectorAll("button");

const params = new URLSearchParams(window.location.search);
const room = params.get("room");

let isAllowed = false;

// ❌ No room code
if (!room) {
  statusEl.textContent = "❌ No room code";
} else {
  statusEl.textContent = "⏳ Connecting...";
  socket.emit("join-room", {
    roomCode: room,
    role: "controller"
  });
}

// ✅ Server ACCEPTS controller
socket.on("player-accepted", () => {
  isAllowed = true;
  statusEl.textContent = `✅ Connected to room ${room}`;
});

// ❌ Server REJECTS controller
socket.on("error-message", (msg) => {
  isAllowed = false;
  statusEl.textContent = "❌ " + msg;
});

// 🎮 SEND INPUT (ONLY IF ALLOWED)
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!isAllowed) return;

    const action = btn.dataset.action;
    socket.emit("controller-input", {
      room,
      action
    });
  });
});
