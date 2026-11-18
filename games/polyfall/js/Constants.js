export const COLS = 10;
export const ROWS = 20;
export const CELL_SIZE = 30;
export const COLORS = [
  "#62e5d1", "#73a7ff", "#c18aff", "#ffca69", "#ff7e9e",
  "#8ee17b", "#f28bff", "#53d5ff", "#ff9d65", "#b5a4ff", "#e8e77b"
];

export const SHAPES = [
  { name: "I", color: 0, cells: [[0,0],[1,0],[2,0],[3,0]] },
  { name: "O", color: 1, cells: [[0,0],[1,0],[0,1],[1,1]] },
  { name: "T", color: 2, cells: [[1,0],[0,1],[1,1],[2,1]] },
  { name: "S", color: 3, cells: [[1,0],[2,0],[0,1],[1,1]] },
  { name: "Z", color: 4, cells: [[0,0],[1,0],[1,1],[2,1]] },
  { name: "J", color: 5, cells: [[0,0],[0,1],[1,1],[2,1]] },
  { name: "L", color: 6, cells: [[2,0],[0,1],[1,1],[2,1]] },
  { name: "Penta-P", color: 7, cells: [[0,0],[1,0],[0,1],[1,1],[0,2]] },
  { name: "Penta-U", color: 8, cells: [[0,0],[2,0],[0,1],[1,1],[2,1]] },
  { name: "Penta-V", color: 9, cells: [[0,0],[0,1],[0,2],[1,2],[2,2]] },
  { name: "Penta-W", color: 10, cells: [[0,0],[0,1],[1,1],[1,2],[2,2]] },
  { name: "Penta-T", color: 0, cells: [[0,0],[1,0],[2,0],[1,1],[1,2]] },
  { name: "Penta-X", color: 1, cells: [[1,0],[0,1],[1,1],[2,1],[1,2]] },
  { name: "Penta-F", color: 2, cells: [[1,0],[2,0],[0,1],[1,1],[1,2]] },
  { name: "Hexa-Ring", color: 3, cells: [[0,0],[1,0],[2,0],[0,1],[2,1],[1,2]] },
  { name: "Hexa-Stair", color: 4, cells: [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]] },
  { name: "Hexa-Plus", color: 5, cells: [[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]] },
  { name: "Hexa-Hook", color: 6, cells: [[0,0],[0,1],[0,2],[1,2],[2,2],[2,3]] },
  { name: "Hexa-Snake", color: 7, cells: [[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]] },
  { name: "Mini-Duo", color: 8, cells: [[0,0],[1,0]] },
  { name: "Dot", color: 9, cells: [[0,0]] }
];