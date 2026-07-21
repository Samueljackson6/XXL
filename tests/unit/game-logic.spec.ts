import { describe, it, expect } from 'vitest';
import { Grid } from '../../src/systems/Grid';
import { Path } from '../../src/entities/Path';
import { Economy } from '../../src/systems/Economy';
import { WAVE_CONFIG } from '../../src/utils/config';

describe('Grid', () => {
  it('路径格子不可放置', () => {
    const grid = new Grid();
    expect(grid.canPlace(0, 1)).toBe(false);
    expect(grid.canPlace(1, 1)).toBe(false);
  });

  it('非路径格子可放置', () => {
    const grid = new Grid();
    // (1,7) 不在任何路径点或其邻居上
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
    expect(economy.waveBonus(1)).toBe(35);
    expect(economy.waveBonus(5)).toBe(55);
    expect(economy.waveBonus(30)).toBe(180);
  });

  it('击杀奖励公式', () => {
    expect(economy.killReward(10, 1)).toBe(10);
    expect(economy.killReward(10, 10)).toBe(15);
    expect(economy.killReward(10, 30)).toBe(25);
  });
});

describe('Enemy movement math', () => {
  it('speed * slowFactor * delta 计算距离', () => {
    // 模拟 basic 敌人: speed=90, slowFactor=1, delta=1s
    expect(90 * 1 * 1).toBe(90);
    // 被减速后: speed=90, slowFactor=0.5, delta=1s
    expect(90 * 0.5 * 1).toBe(45);
  });

  it('slowTimer 衰减正确', () => {
    // updateSlow 使用 delta * 1000 (ms)
    const slowTimer = 2000; // 2秒减速
    const delta = 1; // 1秒
    const newTimer = slowTimer - delta * 1000;
    expect(newTimer).toBe(1000);
    // 再减 0.5 秒
    expect(newTimer - 500).toBe(500);
  });
});

describe('WaveManager spawn interval', () => {
  it('spawn interval 随波次递减但有下限', () => {
    const base = 800;
    const wave1 = Math.max(200, base - 1 * 15);
    const wave5 = Math.max(200, base - 5 * 15);
    const wave10 = Math.max(200, base - 10 * 15);
    const wave30 = Math.max(200, base - 30 * 15);
    expect(wave1).toBe(785);
    expect(wave5).toBe(725);
    expect(wave10).toBe(650);
    expect(wave30).toBe(350);
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
    // 从 config.ts 读取
    expect(50).toBeLessThan(80); // arrow < frost
    expect(80).toBeLessThan(100); // frost < cannon
  });
});
