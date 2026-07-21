import * as Phaser from 'phaser';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  GAME_WIDTH,
  GAME_HEIGHT,
  TOWER_TYPES,
  ECONOMY_CONFIG,
  WAVE_CONFIG,
} from '../utils/config';
import { Grid } from '../systems/Grid';
import { WaveManager } from '../systems/WaveManager';
import { Economy } from '../systems/Economy';
import { Path } from '../entities/Path';
import { Tower, type TowerType } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { HUD } from '../ui/HUD';
import { TowerSelectBar } from '../ui/TowerSelectBar';
import { TowerInfoPanel } from '../ui/TowerInfoPanel';
import { FloatingText } from '../fx/FloatingText';
import { AudioManager } from '../audio/AudioManager';
import type { WaveState } from '../systems/CombatState';
import { WAVE_STATE } from '../systems/CombatState';

export default class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private path!: Path;
  private waveManager!: WaveManager;
  private economy!: Economy;
  private hud!: HUD;
  private towerSelectBar!: TowerSelectBar;
  private towerInfoPanel!: TowerInfoPanel;
  private audioManager!: AudioManager;

  private towers: Tower[] = [];
  private selectedTower: Tower | null = null;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private selectedTowerType: TowerType | null = null;

  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;

  private pathLength: number = 0;
  private waveSurvived: number = 0;
  private totalKills: number = 0;
  private gameOver: boolean = false;
  private state: WaveState = WAVE_STATE.IDLE;
  private prepareTimer: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.grid = new Grid();
    this.path = new Path();

    this.pathLength = this.path.getTotalLength();
    this.economy = new Economy();
    this.waveManager = new WaveManager(this, this.onWaveComplete);
    this.hud = new HUD(this);
    this.towerSelectBar = new TowerSelectBar(this, this.state);
    this.towerInfoPanel = new TowerInfoPanel(this);
    this.audioManager = new AudioManager();

    this.towerInfoPanel.onUpgrade = () => {
      if (this.selectedTower && this.economy.spend(this.selectedTower.getUpgradeCost())) {
        this.selectedTower.upgrade();
        this.towerInfoPanel.refresh();
        this.audioManager.play('towerUpgrade');
      }
    };
    this.towerInfoPanel.onSell = () => {
      if (this.selectedTower) {
        this.economy.earn(this.selectedTower.getSellValue());
        this.towers = this.towers.filter((t) => t !== this.selectedTower);
        this.selectedTower.destroy();
        this.towerInfoPanel.hide();
        this.selectedTower = null;
        this.audioManager.play('towerSell');
      }
    };

    this.drawGrid();
    this.drawPathOverlay();
    this.setupInput();
    this.setupTowerSelect();

    this.waveSurvived = 0;
    this.totalKills = 0;
    this.gameOver = false;

    this.startPreparePhase();
  }

  private startPreparePhase(): void {
    this.state = WAVE_STATE.PREPARE;
    this.prepareTimer = WAVE_CONFIG.prepareTime * 1000;
    this.towerSelectBar.updateState(this.state);
  }

  private startFightingPhase(): void {
    this.state = WAVE_STATE.FIGHTING;
    this.towerSelectBar.updateState(this.state);
    this.waveManager.startNextWave();
  }

  private drawGrid(): void {
    this.gridGraphics = this.add.graphics();
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        this.gridGraphics.fillStyle(0x2e7d32);
        this.gridGraphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.gridGraphics.lineStyle(1, 0x1b5e20, 0.3);
        this.gridGraphics.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  private drawPathOverlay(): void {
    this.pathGraphics = this.add.graphics();
    const points = this.path.getPoints();

    this.pathGraphics.lineStyle(34, 0x4e342e, 0.5);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.pathGraphics.lineTo(points[i].x, points[i].y);
    }
    this.pathGraphics.strokePath();

    this.pathGraphics.lineStyle(28, 0x795548, 1);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.pathGraphics.lineTo(points[i].x, points[i].y);
    }
    this.pathGraphics.strokePath();
  }

  private setupInput(): void {
    this.previewGraphics = this.add.graphics();
    this.previewGraphics.setVisible(false);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) return;

      const clickedTower = this.getTowerAt(pointer.x, pointer.y);
      if (clickedTower) {
        if (this.selectedTower === clickedTower) {
          this.selectedTower.showRange(false);
          this.selectedTower = null;
          this.towerInfoPanel.hide();
          return;
        }
        if (this.selectedTower) {
          this.selectedTower.showRange(false);
        }
        this.selectedTower = clickedTower;
        this.selectedTower.showRange(true);
        this.towerInfoPanel.show({
          scene: this,
          x: clickedTower.x,
          y: clickedTower.y,
          towerType: clickedTower.towerType,
          level: clickedTower.level,
          damage: clickedTower.damage,
          range: clickedTower.range,
        });
        this.selectedTowerType = null;
        this.towerSelectBar.setSelectedType(null);
        return;
      }

      if (this.selectedTower) {
        this.selectedTower.showRange(false);
        this.selectedTower = null;
      }
      this.towerInfoPanel.hide();

      if (this.state !== WAVE_STATE.PREPARE) return;
      if (!this.selectedTowerType) return;

      const col = this.grid.getGridCol(pointer.x);
      const row = this.grid.getGridRow(pointer.y);

      if (!this.grid.canPlace(col, row)) return;

      const config = TOWER_TYPES[this.selectedTowerType];
      if (!this.economy.canAfford(config.cost)) return;

      this.economy.spend(config.cost);
      this.grid.place(col, row);

      const towerX = col * TILE_SIZE + TILE_SIZE / 2;
      const towerY = row * TILE_SIZE + TILE_SIZE / 2;
      const tower = new Tower(this, towerX, towerY, this.selectedTowerType);
      this.towers.push(tower);
      this.audioManager.play('towerPlace');
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.selectedTowerType || this.gameOver || this.state !== WAVE_STATE.PREPARE) {
        this.previewGraphics.setVisible(false);
        return;
      }

      const col = this.grid.getGridCol(pointer.x);
      const row = this.grid.getGridRow(pointer.y);
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      const canPlace = this.grid.canPlace(col, row);

      this.previewGraphics.clear();
      this.previewGraphics.setVisible(true);
      this.previewGraphics.fillStyle(canPlace ? 0x4fc3f7 : 0xff0000, 0.3);
      this.previewGraphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      this.previewGraphics.lineStyle(2, canPlace ? 0x4fc3f7 : 0xff0000, 0.8);
      this.previewGraphics.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

      if (canPlace) {
        const config = TOWER_TYPES[this.selectedTowerType];
        this.previewGraphics.lineStyle(1, 0xffffff, 0.2);
        this.previewGraphics.strokeCircle(x + TILE_SIZE / 2, y + TILE_SIZE / 2, config.range);
      }
    });
  }

  private setupTowerSelect(): void {
    this.towerSelectBar.onSelect = (type: TowerType) => {
      if (this.selectedTower) {
        this.selectedTower.showRange(false);
        this.selectedTower = null;
      }
      this.towerInfoPanel.hide();
      if (this.state !== WAVE_STATE.PREPARE) return;
      this.selectedTowerType = this.selectedTowerType === type ? null : type;
      this.towerSelectBar.setSelectedType(this.selectedTowerType);
    };

    this.towerSelectBar.onStartWave = () => {
      if (this.selectedTower) {
        this.selectedTower.showRange(false);
        this.selectedTower = null;
      }
      this.towerInfoPanel.hide();
      if (this.state !== WAVE_STATE.PREPARE) return;
      this.audioManager.play('waveStart');
      this.startFightingPhase();
    };
  }

  private onEnemyReachEnd = (): void => {
    this.economy.loseLife();
    if (this.economy.lives <= 0) {
      this.endGame();
    }
  };

  private onWaveComplete = (): void => {
    this.waveSurvived = this.waveManager.currentWave;
    const bonus =
      this.waveManager.currentWave * ECONOMY_CONFIG.waveBonusPerWave + ECONOMY_CONFIG.waveBonusBase;
    this.economy.earn(bonus);
    this.economy.save();
    this.audioManager.play('waveComplete');
    new FloatingText(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 80,
      `WAVE ${this.waveManager.currentWave} CLEAR`,
      '#ffffff',
      'large',
    );

    if (this.waveManager.currentWave >= this.waveManager.totalWaves) {
      this.state = WAVE_STATE.VICTORY;
      this.audioManager.play('gameOver');
      this.time.delayedCall(1000, () => this.endGame());
    } else {
      this.state = WAVE_STATE.INTERMISSION;
      this.towerSelectBar.updateState(this.state);
      this.time.delayedCall(WAVE_CONFIG.intermissionTime * 1000, () => {
        this.startPreparePhase();
      });
    }
  };

  private getTowerAt(x: number, y: number): Tower | null {
    for (let i = this.towers.length - 1; i >= 0; i--) {
      const t = this.towers[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (Math.abs(dx) <= TILE_SIZE / 2 && Math.abs(dy) <= TILE_SIZE / 2) {
        return t;
      }
    }
    return null;
  }

  private endGame(): void {
    if (this.gameOver) return;
    this.gameOver = true;

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        survived: this.waveSurvived,
        killed: this.totalKills,
      });
    });
  }

  registerEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  update(time: number, delta: number): void {
    if (this.gameOver) return;

    const dt = delta / 1000;

    // State machine updates
    if (this.state === WAVE_STATE.PREPARE) {
      this.prepareTimer -= delta;
      this.towerSelectBar.updateTimer(this.prepareTimer);
      if (this.prepareTimer <= 0) {
        this.startFightingPhase();
      }
    }

    // Update affordability
    const affordMap: Record<TowerType, boolean> = {
      arrow: this.economy.canAfford(TOWER_TYPES.arrow.cost),
      cannon: this.economy.canAfford(TOWER_TYPES.cannon.cost),
      frost: this.economy.canAfford(TOWER_TYPES.frost.cost),
    };
    this.towerSelectBar.updateAffordability(affordMap);

    // Update wave manager
    this.waveManager.update(dt);

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        enemy.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      enemy.move(dt);
      enemy.updateSlow(dt);

      const pos = this.path.getPointOnPath(enemy.distanceTraveled);
      enemy.setPosition(pos.x, pos.y);

      if (enemy.distanceTraveled >= this.pathLength) {
        enemy.alive = false;
        this.onEnemyReachEnd();
      }
    }

    // Tower targeting and firing
    for (const tower of this.towers) {
      if (!tower.canFire(time)) continue;

      let closestEnemy: Enemy | null = null;
      let closestDist = tower.range;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }

      if (closestEnemy) {
        tower.fire(time);
        const typeConfig = TOWER_TYPES[tower.towerType];
        const proj = new Projectile(
          this,
          tower.x,
          tower.y,
          closestEnemy,
          tower.damage,
          typeConfig.projectileSpeed,
          tower.towerType,
          typeConfig.aoeRadius,
          typeConfig.slowEffect,
        );
        this.projectiles.push(proj);
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const stillMoving = proj.update(dt);

      if (!stillMoving) {
        if (proj.aoeRadius > 0) {
          for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - proj.projX;
            const dy = enemy.y - proj.projY;
            if (Math.sqrt(dx * dx + dy * dy) < proj.aoeRadius) {
              const dead = enemy.takeDamage(proj.damage);
              if (dead) {
                enemy.alive = false;
                this.waveManager.onEnemyRemoved(enemy);
                const reward = this.economy.killReward(enemy.reward, this.waveManager.currentWave);
                this.economy.earn(reward);
                this.totalKills++;
                new FloatingText(this, proj.projX, proj.projY - 10, `+${reward}`);
                this.audioManager.play('enemyDeath');
              }
            }
          }
        } else {
          let closestEnemy: Enemy | null = null;
          let closestDist = 18;

          for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - proj.projX;
            const dy = enemy.y - proj.projY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }

          if (closestEnemy) {
            const dead = closestEnemy.takeDamage(proj.damage);
            if (dead) {
              closestEnemy.alive = false;
              this.waveManager.onEnemyRemoved(closestEnemy);
              const reward = this.economy.killReward(
                closestEnemy.reward,
                this.waveManager.currentWave,
              );
              this.economy.earn(reward);
              this.totalKills++;
              new FloatingText(this, closestEnemy.x, closestEnemy.y - 10, `+${reward}`);
              this.audioManager.play('enemyDeath');
            }
            if (proj.slowEffect) {
              closestEnemy.applySlow(proj.slowEffect.duration, proj.slowEffect.factor);
            }
          }
        }

        proj.destroy();
        this.projectiles.splice(i, 1);
      }
    }

    // Update HUD
    this.hud.update(
      this.economy.gold,
      this.economy.lives,
      this.waveManager.currentWave,
      this.waveManager.totalWaves,
    );
  }
}
