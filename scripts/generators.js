/**
 * Function that generates a cell and returns it
 * @callback CellGenerator
 * @param {Number} row The row number of the cell
 * @param {Number} column The column number of the cell
 * @returns {HTMLDivElement} The HTML element that represents the cell
 */

export class Generator {
  /**
   * @param  {number} rows
   * @param  {number} columns
   * @param  {CellGenerator} cellGenFunction function that generates a cell and returns it
   */
  static generateGrid(rows, columns, cellGenFunction = (r, c) => {}) {
    let grid = document.createElement("div");
    /** @type {Array<HTMLDivElement>} */
    let cells = [];
    grid.classList.add("gen-grid");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    grid.style.zIndex = "10";
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        let cell = cellGenFunction(i, j) || document.createElement("div");
        cells.push(cell);
        grid.appendChild(cell);
      }
    }
    return { grid, cells };
  }
  /**
   * @param  {{ colors: Array<string>, grid: { rows: number, columns: number } }} options
   */
  static generateToolBar(
    options = {
      colors: ["red", "blue", "green"],
      grid: { rows: 10, columns: 2 },
    },
    btnGenFunction
  ) {
    let { colors, grid: { columns, rows } = { rows: 2, columns: 10 } } =
      options;

    let colorPaletteDiv = document.createElement("div");
    colorPaletteDiv.classList.add("color-palette");
    colorPaletteDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    colorPaletteDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    colorPaletteDiv.style.gridAutoFlow = "row";

    for (let color of colors) {
      let colorDiv = btnGenFunction(color);
      colorDiv.dataset.color = color;
      colorPaletteDiv.appendChild(colorDiv);
    }

    return colorPaletteDiv;
  }
}
