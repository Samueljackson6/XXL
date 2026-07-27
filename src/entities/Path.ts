import { PATH_POINTS, TILE_SIZE, HUD_HEIGHT } from '../utils/config';

export class Path {
  private points: { x: number; y: number }[];

  constructor() {
    this.points = PATH_POINTS.map((p) => ({
      x: p.x * TILE_SIZE + TILE_SIZE / 2,
      y: p.y * TILE_SIZE + HUD_HEIGHT + TILE_SIZE / 2,
    }));
  }

  getPoints(): { x: number; y: number }[] {
    return this.points;
  }

  getTotalLength(): number {
    let length = 0;
    for (let i = 1; i < this.points.length; i++) {
      const dx = this.points[i].x - this.points[i - 1].x;
      const dy = this.points[i].y - this.points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  getPointOnPath(distance: number): { x: number; y: number } {
    let remaining = distance;
    for (let i = 1; i < this.points.length; i++) {
      const dx = this.points[i].x - this.points[i - 1].x;
      const dy = this.points[i].y - this.points[i - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      if (remaining <= segmentLength) {
        const t = remaining / segmentLength;
        return {
          x: this.points[i - 1].x + dx * t,
          y: this.points[i - 1].y + dy * t,
        };
      }
      remaining -= segmentLength;
    }
    return { ...this.points[this.points.length - 1] };
  }

  getGridPositions(): { col: number; row: number }[] {
    const positions: { col: number; row: number }[] = [];
    for (const p of this.points) {
      const col = Math.floor(p.x / TILE_SIZE);
      const row = Math.floor(p.y / TILE_SIZE);
      positions.push({ col, row });
    }
    return positions;
  }
}
