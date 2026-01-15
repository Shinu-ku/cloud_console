const socket = io();

const statusEl = document.getElementById("status");
const buttons = document.querySelectorAll("button");

const params = new URLSearchParams(window.location.search);
const room = params.get("room");

if (!room) {
  statusEl.textContent = "❌ No room code";
} else {
  socket.emit("join-room", room);
  statusEl.textContent = `Connected to room ${room}`;
}

// SEND INPUT
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    socket.emit("controller-input", {
      room,
      action
    });
  });
});
