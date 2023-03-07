import { config } from "../config.js";

const createRoomBtn = document.getElementById("create-room-btn");

createRoomBtn.onclick = createRoom;

async function createRoom() {
  let res = await fetch(`${config.backend_uri}createroom`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  let data = await res.json();
  if (data?.success) {
    // Good to redirect
    window.location.href = `/room.html?room=${data.data.roomId}`;
  }
}
