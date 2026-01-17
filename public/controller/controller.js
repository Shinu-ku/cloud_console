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
// 🎹 KEYBOARD INPUT (CONTROLLER)
window.addEventListener("keydown", (e) => {
  if (!isAllowed) return;

  let action = null;

  switch (e.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      action = "left";
      break;

    case "ArrowRight":
    case "d":
    case "D":
      action = "right";
      break;

    case "ArrowUp":
    case "w":
    case "W":
      action = "jump";
      break;

    case "ArrowDown":
    case "s":
    case "S":
      action = "down";
      break;  
  }

  if (action) {
    e.preventDefault();
    socket.emit("controller-input", {
      room,
      action
    });
  }
});
