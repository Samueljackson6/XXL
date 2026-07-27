import { PATH_POINTS, GRID_COLS, GRID_ROWS, TILE_SIZE } from '../utils/GameConfig';

export class Grid {
  occupied: boolean[][] = [];
  pathCells: Set<string> = new Set();

  constructor() {
    this.occupied = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
    this.markPathCells();
  }

  private markPathCells(): void {
    for (const p of PATH_POINTS) {
      this.pathCells.add(`${p.x},${p.y}`);
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS) {
          this.pathCells.add(`${nx},${ny}`);
        }
      }
    }
  }

  canPlace(col: number, row: number): boolean {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
    if (this.pathCells.has(`${col},${row}`)) return false;
    if (this.occupied[row][col]) return false;
    return true;
  }

  place(col: number, row: number): void {
    this.occupied[row][col] = true;
  }

  getGridCol(x: number): number {
    return Math.floor(x / TILE_SIZE);
  }

  getGridRow(y: number): number {
    return Math.floor(y / TILE_SIZE);
  }

  isPathCell(col: number, row: number): boolean {
    return this.pathCells.has(`${col},${row}`);
  }
}
