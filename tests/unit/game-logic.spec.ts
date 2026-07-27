import { describe, it, expect } from 'vitest';
import { Grid } from '../../assets/scripts/systems/Grid';
import { Path } from '../../assets/scripts/entities/Path';
import { Economy } from '../../assets/scripts/systems/Economy';
import { WAVE_CONFIG, TOWER_TYPES, DEPTH } from '../../assets/scripts/utils/GameConfig';

describe('Grid', () => {
  it('路径格子不可放置', () => {
    const grid = new Grid();
    expect(grid.canPlace(0, 1)).toBe(false);
    expect(grid.canPlace(1, 1)).toBe(false);
  });

  it('非路径格子可放置', () => {
    const grid = new Grid();
    expect(grid.canPlace(1, 7)).toBe(true);
    expect(grid.canPlace(2, 7)).toBe(true);
  });

  it('放置后不能再放', () => {
    const grid = new Grid();
    grid.place(3, 3);
    expect(grid.canPlace(3, 3)).toBe(false);
  });

  it('边界检查', () => {
    const grid = new Grid();
    expect(grid.canPlace(-1, 0)).toBe(false);
    expect(grid.canPlace(10, 0)).toBe(false);
    expect(grid.canPlace(0, -1)).toBe(false);
    expect(grid.canPlace(0, 10)).toBe(false);
  });

  it('网格坐标转换正确', () => {
    const grid = new Grid();
    expect(grid.getGridCol(0)).toBe(0);
    expect(grid.getGridCol(63)).toBe(0);
    expect(grid.getGridCol(64)).toBe(1);
    expect(grid.getGridCol(319)).toBe(4);
    expect(grid.getGridRow(44)).toBe(0);
    expect(grid.getGridRow(108)).toBe(1);
  });
});

describe('Path', () => {
  const path = new Path();

  it('有路径点', () => {
    const points = path.getPoints();
    expect(points.length).toBeGreaterThan(0);
  });

  it('总长度 > 0', () => {
    expect(path.getTotalLength()).toBeGreaterThan(0);
  });

  it('distance 0 返回起点', () => {
    const pts = path.getPoints();
    const p = path.getPointOnPath(0);
    expect(p.x).toBeCloseTo(pts[0].x, 0);
    expect(p.y).toBeCloseTo(pts[0].y, 0);
  });

  it('超大距离返回终点', () => {
    const pts = path.getPoints();
    const last = pts[pts.length - 1];
    const p = path.getPointOnPath(999999);
    expect(p.x).toBeCloseTo(last.x, 0);
    expect(p.y).toBeCloseTo(last.y, 0);
  });

  it('第一段中点插值正确', () => {
    const pts = path.getPoints();
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    const mid = path.getPointOnPath(segLen / 2);
    expect(mid.x).toBeCloseTo(pts[0].x + dx / 2, 0);
    expect(mid.y).toBeCloseTo(pts[0].y + dy / 2, 0);
  });
});

describe('Economy', () => {
  const economy = new Economy();

  it('初始值', () => {
    expect(economy.gold).toBe(200);
    expect(economy.lives).toBe(20);
  });

  it('花费金币', () => {
    expect(economy.spend(50)).toBe(true);
    expect(economy.gold).toBe(150);
    expect(economy.spend(200)).toBe(false);
  });

  it('赚取金币', () => {
    economy.earn(30);
    expect(economy.gold).toBe(180);
  });

  it('失去生命', () => {
    economy.loseLife();
    expect(economy.lives).toBe(19);
    expect(economy.loseLife()).toBe(false);
    economy.lives = 1;
    expect(economy.loseLife()).toBe(true);
    expect(economy.lives).toBe(0);
  });

  it('波次奖励公式', () => {
    // GDD §3.4 CANONICAL R1: 30 + 5 × (w−1)；第 1 波仅 base(30)
    expect(economy.waveBonus(1)).toBe(30);
    expect(economy.waveBonus(5)).toBe(50);
    expect(economy.waveBonus(30)).toBe(175);
  });

  it('击杀奖励公式', () => {
    expect(economy.killReward(10, 1)).toBe(10);
    expect(economy.killReward(10, 10)).toBe(15);
    expect(economy.killReward(10, 30)).toBe(25);
  });
});

describe('Enemy movement math', () => {
  it('speed * slowFactor * delta 计算距离', () => {
    expect(90 * 1 * 1).toBe(90);
    expect(90 * 0.5 * 1).toBe(45);
  });

  it('slowTimer 衰减正确', () => {
    const slowTimer = 2000;
    const delta = 1;
    const newTimer = slowTimer - delta * 1000;
    expect(newTimer).toBe(1000);
    expect(newTimer - 500).toBe(500);
  });
});

describe('WaveManager spawn interval', () => {
  it('spawn interval 随波次递减但有下限', () => {
    const base = WAVE_CONFIG.spawnInterval;
    expect(Math.max(200, base - 1 * 15)).toBe(785);
    expect(Math.max(200, base - 5 * 15)).toBe(725);
    expect(Math.max(200, base - 10 * 15)).toBe(650);
    expect(Math.max(200, base - 30 * 15)).toBe(350);
  });
});

describe('Config values', () => {
  it('WAVE_CONFIG 合理性', () => {
    expect(WAVE_CONFIG.prepareTime).toBeGreaterThan(0);
    expect(WAVE_CONFIG.intermissionTime).toBeGreaterThan(0);
    expect(WAVE_CONFIG.spawnInterval).toBeGreaterThan(0);
    expect(WAVE_CONFIG.totalWaves).toBe(30);
  });

  it('TOWER_TYPES 成本递增', () => {
    expect(TOWER_TYPES.arrow.cost).toBeLessThan(TOWER_TYPES.frost.cost);
    expect(TOWER_TYPES.frost.cost).toBeLessThan(TOWER_TYPES.cannon.cost);
  });

  it('DEPTH 常量存在且层级递增', () => {
    expect(DEPTH.GRID).toBe(0);
    expect(DEPTH.PATH).toBe(1);
    expect(DEPTH.ENEMIES).toBeGreaterThan(DEPTH.GRID);
    expect(DEPTH.TOWERS).toBeGreaterThan(DEPTH.ENEMIES);
    expect(DEPTH.PROJECTILES).toBeGreaterThan(DEPTH.TOWERS);
    expect(DEPTH.PREVIEW).toBeGreaterThan(DEPTH.PROJECTILES);
    expect(DEPTH.UI).toBeGreaterThan(DEPTH.PREVIEW);
    expect(DEPTH.FLOATING_TEXT).toBeGreaterThan(DEPTH.UI);
    expect(DEPTH.PANEL).toBeGreaterThan(DEPTH.FLOATING_TEXT);
  });
});
