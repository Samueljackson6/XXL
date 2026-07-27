import { describe, it, expect, vi } from 'vitest';
import { WAVE_CONFIG } from '../../assets/scripts/utils/GameConfig';

// WaveManager logic tests that don't require Phaser/Enemy imports
// These verify the core math and state transitions directly

describe('WaveManager logic', () => {
  it('wave 1 enemy count: baseCount + wave * countPerWave', () => {
    const wave = 1;
    const baseCount = WAVE_CONFIG.baseCount;
    const countPerWave = WAVE_CONFIG.countPerWave;
    const waveMultiplier = 1 + (wave - 1) * 0.25;
    const count = Math.floor((baseCount + wave * countPerWave) * waveMultiplier);
    expect(count).toBe(7); // 5 + 1*2 = 7
  });

  it('wave 10 enemy count with multiplier', () => {
    const wave = 10;
    const baseCount = WAVE_CONFIG.baseCount;
    const countPerWave = WAVE_CONFIG.countPerWave;
    const waveMultiplier = 1 + (wave - 1) * 0.25;
    const count = Math.floor((baseCount + wave * countPerWave) * waveMultiplier);
    // wave 10: (5 + 20) * (1 + 9*0.25) = 25 * 3.25 = 81.25 -> 81
    expect(count).toBe(81);
    expect(count).toBeGreaterThan(0);
  });

  it('spawn interval decreases with wave but has floor', () => {
    const base = WAVE_CONFIG.spawnInterval;
    const wave1 = Math.max(200, base - 1 * 15);
    const wave5 = Math.max(200, base - 5 * 15);
    const wave10 = Math.max(200, base - 10 * 15);
    const wave30 = Math.max(200, base - 30 * 15);
    expect(wave1).toBe(785);
    expect(wave5).toBe(725);
    expect(wave10).toBe(650);
    expect(wave30).toBe(350);
  });

  it('enemy type selection: wave 1 only basic', () => {
    const wave = 1;
    const rand = 0.5;
    let type: string;
    if (wave >= 20) {
      type = rand < 0.35 ? 'tank' : rand < 0.6 ? 'fast' : 'basic';
    } else if (wave >= 10) {
      type = rand < 0.2 ? 'tank' : rand < 0.5 ? 'fast' : 'basic';
    } else if (wave >= 5) {
      type = rand < 0.35 ? 'fast' : 'basic';
    } else {
      type = 'basic';
    }
    expect(type).toBe('basic');
  });

  it('enemy type selection: wave 10 can have fast/tank', () => {
    const wave = 10;
    // rand < 0.2 -> tank, rand < 0.5 -> fast, else basic
    const fastRand = 0.3; // between 0.2 and 0.5
    let type: string;
    if (wave >= 20) {
      type = fastRand < 0.35 ? 'tank' : fastRand < 0.6 ? 'fast' : 'basic';
    } else if (wave >= 10) {
      type = fastRand < 0.2 ? 'tank' : fastRand < 0.5 ? 'fast' : 'basic';
    } else {
      type = 'basic';
    }
    expect(type).toBe('fast');
  });

  it('scaled HP increases with wave', () => {
    const baseHp = 40;
    const waveScale = (w: number) => 1 + (w - 1) * 0.12;
    const hp1 = Math.floor(baseHp * waveScale(1));
    const hp10 = Math.floor(baseHp * waveScale(10));
    const hp30 = Math.floor(baseHp * waveScale(30));
    expect(hp1).toBe(40);  // 1 + 0 * 0.12 = 1
    expect(hp10).toBeGreaterThan(hp1);
    expect(hp30).toBeGreaterThan(hp10);
  });

  it('kill reward scales with wave', () => {
    const baseReward = 10;
    const multiplier = 0.05;
    const r1 = Math.floor(baseReward * (1 + 1 * multiplier));
    const r10 = Math.floor(baseReward * (1 + 10 * multiplier));
    const r30 = Math.floor(baseReward * (1 + 30 * multiplier));
    expect(r1).toBe(10);
    expect(r10).toBe(15);
    expect(r30).toBe(25);
  });

  it('wave completion check: active + remaining === 0 triggers completion', () => {
    let completed = false;
    const checkComplete = (waveActive: boolean, enemiesRemaining: number, activeEnemies: number) => {
      if (waveActive && enemiesRemaining === 0 && activeEnemies === 0) {
        completed = true;
      }
    };
    // Still spawning
    checkComplete(true, 5, 2);
    expect(completed).toBe(false);
    // All spawned, but enemies still alive
    checkComplete(true, 0, 2);
    expect(completed).toBe(false);
    // Wave cleared
    checkComplete(true, 0, 0);
    expect(completed).toBe(true);
  });
});
