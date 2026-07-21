import * as Phaser from 'phaser';
import { Enemy, type EnemyType } from '../entities/Enemy';
import { ENEMY_TYPES, WAVE_CONFIG } from '../utils/config';

interface IGameScene {
  registerEnemy(enemy: Enemy): void;
}

export class WaveManager {
  currentWave: number = 0;
  totalWaves: number = WAVE_CONFIG.totalWaves;
  enemiesRemaining: number = 0;
  activeEnemies: Enemy[] = [];
  waveActive: boolean = false;
  betweenWaves: boolean = false;
  intermissionTimer: number = 0;
  waveSpawnTimer: number = 0;
  waveEnemiesToSpawn: number = 0;

  private gameScene: Phaser.Scene & IGameScene;
  private onWaveComplete: () => void;

  constructor(gameScene: Phaser.Scene & IGameScene, onWaveComplete: () => void) {
    this.gameScene = gameScene;
    this.onWaveComplete = onWaveComplete;
  }

  startNextWave(): void {
    if (this.waveActive) return;
    this.currentWave++;
    this.waveActive = true;
    this.betweenWaves = false;

    const waveMultiplier = 1 + (this.currentWave - 1) * 0.25;
    const baseCount = WAVE_CONFIG.baseCount + this.currentWave * WAVE_CONFIG.countPerWave;
    this.waveEnemiesToSpawn = Math.floor(baseCount * waveMultiplier);
    this.enemiesRemaining = this.waveEnemiesToSpawn;
    this.waveSpawnTimer = 0;
  }

  getSpawnInterval(): number {
    const base = WAVE_CONFIG.spawnInterval;
    return Math.max(200, base - this.currentWave * 15);
  }

  getEnemyType(): EnemyType {
    const wave = this.currentWave;
    const rand = Math.random();

    if (wave >= 20) {
      if (rand < 0.35) return 'tank';
      if (rand < 0.6) return 'fast';
      return 'basic';
    } else if (wave >= 10) {
      if (rand < 0.2) return 'tank';
      if (rand < 0.5) return 'fast';
      return 'basic';
    } else if (wave >= 5) {
      if (rand < 0.35) return 'fast';
      return 'basic';
    }
    return 'basic';
  }

  getScaledHp(type: EnemyType): number {
    const hpScale = 1 + (this.currentWave - 1) * 0.12;
    return Math.floor(ENEMY_TYPES[type].hp * hpScale);
  }

  getEnemySpeed(type: EnemyType): number {
    return ENEMY_TYPES[type].speed;
  }

  getEnemyReward(type: EnemyType): number {
    return ENEMY_TYPES[type].reward;
  }

  spawnEnemy(type: EnemyType): Enemy {
    const x = -20;
    const y = 1 * 64 + 32;
    const enemy = new Enemy(this.gameScene, x, y, type);
    enemy.hp = this.getScaledHp(type);
    enemy.maxHp = enemy.hp;
    enemy.speed = this.getEnemySpeed(type);
    enemy.reward = this.getEnemyReward(type);
    this.activeEnemies.push(enemy);

    if (this.gameScene.registerEnemy) {
      this.gameScene.registerEnemy(enemy);
    }

    return enemy;
  }

  removeEnemy(enemy: Enemy): void {
    const idx = this.activeEnemies.indexOf(enemy);
    if (idx !== -1) {
      this.activeEnemies.splice(idx, 1);
    }
  }

  onEnemyRemoved(enemy: Enemy): void {
    this.removeEnemy(enemy);
    this.checkWaveComplete();
  }

  private checkWaveComplete(): void {
    if (this.waveActive && this.enemiesRemaining === 0 && this.activeEnemies.length === 0) {
      this.waveActive = false;
      this.betweenWaves = true;
      this.intermissionTimer = WAVE_CONFIG.intermissionTime * 1000;
      this.onWaveComplete();
    }
  }

  update(dt: number): void {
    if (this.waveActive && this.enemiesRemaining > 0) {
      this.waveSpawnTimer -= dt * 1000;
      if (this.waveSpawnTimer <= 0) {
        const type = this.getEnemyType();
        this.spawnEnemy(type);
        this.enemiesRemaining--;
        this.waveSpawnTimer = this.getSpawnInterval();
      }
    }

    if (this.betweenWaves) {
      this.intermissionTimer -= dt * 1000;
    }
  }

  getIntermissionProgress(): number {
    if (!this.betweenWaves) return 1;
    return 1 - this.intermissionTimer / (WAVE_CONFIG.intermissionTime * 1000);
  }

  shouldShowStartButton(): boolean {
    return this.currentWave === 0 || this.betweenWaves;
  }
}
