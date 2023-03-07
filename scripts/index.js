import { config } from "../config.js";
import { Generator } from "./generators.js";
import {
  okzoomer,
  gestureToMatrix,
  getOrigin,
  applyMatrix,
} from "./pinch-zoom/ok-zoomer.js";

const roomId = new URL(window.location.href).searchParams.get("room");

if (!roomId) {
  console.error("room id not found...");
  throw new Error("room id not found. Check the url and try again");
}

const sendMsgBtn = document.getElementById("send-msg");
const sendMsgText = document.getElementById("msg-text");

// GLOBAL VARS
/** @type {HTMLDivElement} */
let selectedCell = null;

/**
 * @param  {HTMLDivElement} cell
 */
function highlightCell(cell) {
  if (selectedCell == cell) {
    unHighlightCell(selectedCell);
    return;
  }
  if (selectedCell != null) unHighlightCell(selectedCell);
  selectedCell = cell;
  selectedCell.classList.add("highlight");
}

/**
 * @param  {HTMLDivElement} cell
 */
function unHighlightCell(cell) {
  cell.classList.remove("highlight");
  selectedCell = null;
}

function handleColorBtnClick(colorBtn) {
  if (selectedCell == null) return;
  socket.emit("pixel-put", {
    row: selectedCell.dataset.row,
    column: selectedCell.dataset.column,
    color: colorBtn.dataset.color,
  });
  unHighlightCell(selectedCell);
}

/**
 * @param  {HTMLDivElement} cell
 */
function handleCellClick(cell) {
  highlightCell(cell);
}

/**
 * @param  {HTMLDivElement} el
 * @param  {string} color
 */
function tempChangeColor(el, color = "pink", perm = false) {
  let defaultBgColor = el.style.backgroundColor;
  el.style.backgroundColor = color;
  if (perm) {
    el.style.backgroundColor = color;
    return;
  }
  setTimeout(() => {
    el.style.backgroundColor = defaultBgColor;
  }, 2000);
}

let { grid: genGrid, cells: genCells } = Generator.generateGrid(
  20,
  20,
  (r, c) => {
    let cell = document.createElement("div");
    cell.dataset.row = r;
    cell.dataset.column = c;
    cell.onclick = (e) => handleCellClick(e.currentTarget);
    return cell;
  }
);

let genColorPalette = Generator.generateToolBar(
  {
    colors: [
      "#6d001a",
      "#be0039",
      "#ffa800",
      "#ffd635",
      "#00a368",
      "#7eed56",
      "#00756f",
      "#009eaa",
      "#00ccc0",
      "#2450a4",
      "#493ac1",
      "#94b3ff",
      "#811e9f",
      "#de107f",
      "#6d482f",
      "#ffb470",
      "#000000",
      "#515252",
      "#898d90",
      "#ffffff",
    ],
  },
  (color) => {
    let colorDiv = document.createElement("button");
    colorDiv.classList.add("color");
    colorDiv.innerHTML = `
      <span class="color-text">${color}</span>
      `;
    colorDiv.style.backgroundColor = color;
    colorDiv.onclick = (e) => handleColorBtnClick(e.currentTarget);
    return colorDiv;
  }
);

document.getElementById("bitmap").appendChild(genGrid);
document.querySelector(".bitmap-toolbar").appendChild(genColorPalette);

if (!window.DOMMatrix) {
  if (window.WebKitCSSMatrix) {
    window.DOMMatrix = window.WebKitCSSMatrix;
  } else {
    throw new Error("Couldn't find a DOM Matrix implementation");
  }
}

let origin;
let initial_ctm = new DOMMatrix();
let el = document.querySelector("#bitmap");
el.style.transformOrigin = "0 0";

okzoomer(document.querySelector(".bitmap-main"), {
  startGesture(gesture) {
    /*
						Clear the element's transform so we can 
						measure its original position wrt. the screen.
						(We don't need to restore it because it gets 
						overwritten by `applyMatrix()` anyways.)
					 */
    el.style.transform = "";
    origin = getOrigin(el, gesture);
    applyMatrix(el, gestureToMatrix(gesture, origin).multiply(initial_ctm));
  },
  doGesture(gesture) {
    applyMatrix(el, gestureToMatrix(gesture, origin).multiply(initial_ctm));
  },
  endGesture(gesture) {
    initial_ctm = gestureToMatrix(gesture, origin).multiply(initial_ctm);
    applyMatrix(el, initial_ctm);
  },
});

const socket = io(`${config.backend_uri}room/${roomId}`);

socket.on("connect", () => {
  console.log({ id: socket.id });
});

socket.on("init", (data) => {
  console.log({ initData: data });
  let pixels = data.pixels;
  Object.keys(pixels).forEach((row) => {
    Object.keys(pixels[row]).forEach((column) => {
      document.querySelector(
        `div[data-row="${row}"][data-column="${column}"]`
      ).style.backgroundColor = pixels[row][column];
    });
  });
});

socket.on("message", (data) => {
  console.log({ receivedFromServer: data });
});

socket.on("pixel-update", (...args) => {
  let data = args[0];
  console.log({ data: data });
  let { row, column, color } = data;
  let cell = document.querySelector(
    `div[data-row="${row}"][data-column="${column}"]`
  );
  tempChangeColor(cell, color, true);
});
