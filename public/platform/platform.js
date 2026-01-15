const socket = io();

const createBtn = document.getElementById("createRoomBtn");
const joinBtn = document.getElementById("joinRoomBtn");
const roomInput = document.getElementById("roomInput");

const roomCodeEl = document.getElementById("roomCode");
const playerCountEl = document.getElementById("playerCount");
const qrEl = document.getElementById("qr");

// CREATE ROOM
if (createBtn) {
  createBtn.onclick = () => {
    socket.emit("create-room");
  };
}

// JOIN ROOM
if (joinBtn) {
  joinBtn.onclick = () => {
    const code = roomInput.value.trim().toUpperCase();
    if (code) {
      window.location.href = `/platform/lobby.html?room=${code}`;
    }
  };
}

// ROOM CREATED
socket.on("room-created", (roomCode) => {
  window.location.href = `/platform/lobby.html?room=${roomCode}`;
});

// LOBBY PAGE LOGIC
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

if (room && roomCodeEl) {
  roomCodeEl.textContent = room;
  socket.emit("join-room", room);

  const qr = new QRCode(qrEl, {
    text: `${window.location.origin}/controller/controller.html?room=${room}`,
    width: 200,
    height: 200,
  });
}

// PLAYER COUNT
socket.on("player-count", (count) => {
  if (playerCountEl) {
    playerCountEl.textContent = count;
  }
});

// ERROR
socket.on("error-message", (msg) => {
  alert(msg);
});

const copyBtn = document.getElementById("copyLinkBtn");

if (copyBtn && room) {
  const joinLink = `${window.location.origin}/controller/controller.html?room=${room}`;

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      copyBtn.textContent = "Link Copied ✅";
      setTimeout(() => {
        copyBtn.textContent = "Copy Join Link";
      }, 1500);
    } catch (err) {
      alert("Copy failed. Please copy manually.");
    }
  };
}

const inputLog = document.getElementById("inputLog");

socket.on("controller-input", (data) => {
  if (inputLog) {
    const msg = document.createElement("div");
    msg.textContent = `🎮 ${data.action.toUpperCase()} pressed`;
    inputLog.prepend(msg);
  }
});
