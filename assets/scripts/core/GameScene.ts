import { _decorator, Component, Node, Graphics, EventTouch, Vec3, input, Input, Event, Color, UITransform } from 'cc';
import { Grid } from '../systems/Grid';
import { WaveManager } from '../systems/WaveManager';
import { Economy } from '../systems/Economy';
import { Path } from '../entities/Path';
import { Tower } from '../entities/Tower';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Projectile, ProjectileConfig } from '../entities/Projectile';
import { HUD } from '../ui/HUD';
import { TowerSelectBar } from '../ui/TowerSelectBar';
import { TowerInfoPanel } from '../ui/TowerInfoPanel';
import { AudioManager } from '../audio/AudioManager';
import { FloatingText } from '../fx/FloatingText';
import {
  GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT, TILE_SIZE, GRID_COLS, GRID_ROWS,
  TOWER_TYPES, ECONOMY_CONFIG, WAVE_CONFIG, DEPTH, TowerType,
} from '../utils/GameConfig';

const { ccclass, property } = _decorator;

interface IGameScene {
  spawnEnemyAt(type: EnemyType, hp: number): void;
  onWaveComplete(): void;
}

@ccclass('GameScene')
export class GameScene extends Component implements IGameScene {
  private grid: Grid | null = null;
  private path: Path | null = null;
  private waveManager: WaveManager | null = null;
  private economy: Economy | null = null;

  private towers: Tower[] = [];
  private selectedTower: Tower | null = null;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private selectedTowerType: TowerType | null = null;

  private hud: HUD | null = null;
  private towerSelectBar: TowerSelectBar | null = null;
  private towerInfoPanel: TowerInfoPanel | null = null;
  private audio: AudioManager | null = null;
  private uiNode: Node | null = null;

  private gridNode: Node | null = null;
  private pathNode: Node | null = null;
  private previewNode: Node | null = null;
  private entityNode: Node | null = null;

  private pathLength: number = 0;
  private waveSurvived: number = 0;
  private totalKills: number = 0;
  private gameOver: boolean = false;
  private prepareTimer: number = 0;
  private state: 'idle' | 'prepare' | 'fighting' | 'intermission' | 'victory' = 'prepare';

  onLoad(): void {
    this.grid = new Grid();
    this.path = new Path();
    this.pathLength = this.path.getTotalLength();
    this.economy = new Economy();
    this.waveManager = new WaveManager();
    this.waveManager.init(this);

    this.gridNode = new Node('grid');
    this.pathNode = new Node('path');
    this.previewNode = new Node('preview');
    this.entityNode = new Node('entities');

    this.node.addChild(this.gridNode);
    this.node.addChild(this.pathNode);
    this.node.addChild(this.previewNode);
    this.node.addChild(this.entityNode);

    this.drawGrid();
    this.drawPathOverlay();
    this.setupInput();
    this.setupTowerSelect();

    this.startPreparePhase();
  }

  private setupTowerSelect(): void {
    this.uiNode = new Node('ui');
    this.uiNode.setPosition(0, 0, DEPTH.UI);
    this.node.addChild(this.uiNode);

    const hudNode = new Node('hud');
    this.uiNode.addChild(hudNode);
    this.hud = hudNode.addComponent(HUD);

    const barNode = new Node('towerSelectBar');
    this.uiNode.addChild(barNode);
    this.towerSelectBar = barNode.addComponent(TowerSelectBar);
    this.towerSelectBar.init(this);
    this.towerSelectBar.onSelect = (t) => this.onTowerSelect(t);
    this.towerSelectBar.onStartWave = () => this.onStartWave();

    const infoNode = new Node('towerInfoPanel');
    this.uiNode.addChild(infoNode);
    this.towerInfoPanel = infoNode.addComponent(TowerInfoPanel);
    this.towerInfoPanel.init();
    this.towerInfoPanel.onUpgrade = () => this.upgradeSelectedTower();
    this.towerInfoPanel.onSell = () => this.sellSelectedTower();

    this.audio = new AudioManager();
  }

  private startPreparePhase(): void {
    this.state = 'prepare';
    this.towerSelectBar?.updateState(this.state);
    this.prepareTimer = WAVE_CONFIG.prepareTime * 1000;
  }

  private startFightingPhase(): void {
    this.state = 'fighting';
    this.towerSelectBar?.updateState(this.state);
    this.audio?.play('waveStart');
    if (this.waveManager) {
      this.waveManager.startNextWave();
    }
  }

  private drawGrid(): void {
    const graphics = this.gridNode!.addComponent(Graphics);
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE + HUD_HEIGHT;

        graphics.fillColor = new Color(46, 125, 50, 255);
        graphics.rect(x, y, TILE_SIZE, TILE_SIZE);
        graphics.fill();

        graphics.strokeColor = new Color(27, 94, 32, 80);
        graphics.lineWidth = 1;
        graphics.rect(x, y, TILE_SIZE, TILE_SIZE);
        graphics.stroke();
      }
    }
  }

  private drawPathOverlay(): void {
    if (!this.path) return;
    const graphics = this.pathNode!.addComponent(Graphics);
    const points = this.path.getPoints();

    graphics.fillColor = new Color(78, 52, 46, 128);
    graphics.lineWidth = 34;
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke();

    graphics.fillColor = new Color(121, 85, 72, 255);
    graphics.lineWidth = 28;
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke();
  }

  private setupInput(): void {
    const eventTouch = this.node.addComponent(EventTouch);
    eventTouch.on(EventTouch.TOUCH_START, this.onPointerDown, this);
    eventTouch.on(EventTouch.TOUCH_MOVE, this.onPointerMove, this);
    input.on(Input.EventType.TOUCH_END, this.onPointerUp, this);
  }

  private onPointerDown(event: EventTouch): void {
    if (this.gameOver) return;
    const pos = event.getUILocation();
    const x = pos.x;
    const y = pos.y;
  }

  private onPointerMove(event: EventTouch): void {
    if (!this.selectedTowerType || this.gameOver || this.state !== 'prepare') {
      if (this.previewNode) this.previewNode.active = false;
      return;
    }

    const pos = event.getUILocation();
    const col = Math.floor(pos.x / TILE_SIZE);
    const row = Math.floor((pos.y - HUD_HEIGHT) / TILE_SIZE);

    if (!this.grid || !this.previewNode) return;

    const canPlace = this.grid.canPlace(col, row);
    this.previewNode.active = true;

    const graphics = this.previewNode.getComponent(Graphics);
    if (!graphics) {
      this.previewNode.addComponent(Graphics);
    }

    const g = this.previewNode.getComponent(Graphics)!;
    g.clear();

    if (canPlace) {
      g.fillColor = new Color(79, 195, 247, 80);
      g.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      g.fill();

      g.strokeColor = new Color(79, 195, 247, 200);
      g.lineWidth = 2;
      g.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      g.stroke();

      const config = TOWER_TYPES[this.selectedTowerType];
      g.strokeColor = new Color(255, 255, 255, 50);
      g.lineWidth = 1;
      g.circle(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + HUD_HEIGHT + TILE_SIZE / 2, config.range);
      g.stroke();
    } else {
      g.fillColor = new Color(255, 0, 0, 80);
      g.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      g.fill();

      g.strokeColor = new Color(255, 0, 0, 200);
      g.lineWidth = 2;
      g.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      g.stroke();
    }
  }

  private onPointerUp(event: EventTouch): void {
    if (this.gameOver) return;
    const pos = event.getUILocation();

    // Tower click handling
    const clickedTower = this.getTowerAt(pos.x, pos.y);
    if (clickedTower) {
      if (this.selectedTower === clickedTower) {
        clickedTower.showRange(false);
        this.selectedTower = null;
        this.towerInfoPanel?.hide();
        return;
      }
      if (this.selectedTower) {
        this.selectedTower.showRange(false);
      }
      this.selectedTower = clickedTower;
      this.selectedTower.showRange(true);
      this.towerInfoPanel?.show(pos.x, pos.y, clickedTower.towerType, clickedTower.level, clickedTower.damage, clickedTower.range);
      this.selectedTowerType = null;
      if (this.previewNode) this.previewNode.active = false;
      return;
    }

    if (this.selectedTower) {
      this.selectedTower.showRange(false);
      this.selectedTower = null;
      this.towerInfoPanel?.hide();
    }

    if (this.state !== 'prepare' || !this.selectedTowerType) return;

    const col = Math.floor(pos.x / TILE_SIZE);
    const row = Math.floor((pos.y - HUD_HEIGHT) / TILE_SIZE);

    if (!this.grid || !this.grid.canPlace(col, row)) return;

    const config = TOWER_TYPES[this.selectedTowerType];
    if (!this.economy || !this.economy.canAfford(config.cost)) return;

    this.economy.spend(config.cost);
    this.grid.place(col, row);

    const towerNode = new Node(`tower_${col}_${row}`);
    const tower = towerNode.addComponent(Tower);
    const towerX = col * TILE_SIZE + TILE_SIZE / 2;
    const towerY = row * TILE_SIZE + HUD_HEIGHT + TILE_SIZE / 2;
    tower.init(this.selectedTowerType, towerX, towerY);
    this.entityNode!.addChild(towerNode);
    this.towers.push(tower);

    this.audio?.play('towerPlace');
    this.spawnFloatingText(towerX, towerY, `+${config.cost}`, '#4fc3f7');
  }

  private getTowerAt(x: number, y: number): Tower | null {
    for (let i = this.towers.length - 1; i >= 0; i--) {
      const t = this.towers[i];
      const nodePos = t.node.getPosition();
      const dx = x - nodePos.x;
      const dy = y - nodePos.y;
      if (Math.abs(dx) <= TILE_SIZE / 2 && Math.abs(dy) <= TILE_SIZE / 2) {
        return t;
      }
    }
    return null;
  }

  private onStartWave(): void {
    if (this.state !== 'prepare') return;
    if (this.selectedTower) {
      this.selectedTower.showRange(false);
      this.selectedTower = null;
    }
    this.startFightingPhase();
  }

  private onEnemyReachEnd = (): void => {
    if (!this.economy) return;
    this.economy.loseLife();
    if (this.economy.lives <= 0) {
      this.endGame();
    }
  };

  onWaveComplete(): void {
    this.waveSurvived = this.waveManager ? this.waveManager.currentWave : 0;
    if (this.economy && this.waveManager) {
      const bonus = this.waveManager.currentWave * ECONOMY_CONFIG.waveBonusPerWave + ECONOMY_CONFIG.waveBonusBase;
      this.economy.earn(bonus);
      this.audio?.play('waveComplete');
    }
    if (this.waveManager && this.waveManager.currentWave >= this.waveManager.totalWaves) {
      this.state = 'victory';
      this.towerSelectBar?.updateState(this.state);
      setTimeout(() => this.endGame(), 1000);
    } else {
      this.state = 'intermission';
      this.towerSelectBar?.updateState(this.state);
      setTimeout(() => this.startPreparePhase(), WAVE_CONFIG.intermissionTime * 1000);
    }
  }

  spawnEnemyAt(type: EnemyType, hp: number): void {
    const enemyNode = new Node(`enemy_${Date.now()}`);
    const enemy = enemyNode.addComponent(Enemy);
    const x = -20;
    const y = 1 * 64 + 32;
    enemy.init(type, x, y);
    enemy.hp = hp;
    enemy.maxHp = hp;
    this.entityNode!.addChild(enemyNode);
    this.enemies.push(enemy);
  }

  private endGame(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.audio?.play('gameOver');
    // Transition to game over scene or show overlay
  }

  update(dt: number): void {
    if (this.gameOver) return;

    const dtSec = dt;

    if (this.state === 'prepare') {
      this.prepareTimer -= dt * 1000;
      if (this.prepareTimer <= 0) {
        this.startFightingPhase();
      }
    }

    if (this.waveManager) {
      this.waveManager.update(dtSec);
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        enemy.node.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      enemy.move(dtSec);
      enemy.updateSlow(dtSec);

      if (this.path) {
        const pos = this.path.getPointOnPath(enemy.distanceTraveled);
        enemy.node.setPosition(pos.x, pos.y);
      }

      if (enemy.distanceTraveled >= this.pathLength) {
        enemy.alive = false;
        if (this.waveManager) {
          this.waveManager.onEnemyRemoved(enemy);
        }
        this.onEnemyReachEnd();
      }
    }

    // Tower targeting and firing
    const now = Date.now();
    for (const tower of this.towers) {
      if (!tower.canFire(now)) continue;

      let closestEnemy: Enemy | null = null;
      let closestDist = tower.range;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const nodePos = enemy.node.getPosition();
        const towerPos = tower.node.getPosition();
        const dx = nodePos.x - towerPos.x;
        const dy = nodePos.y - towerPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }

      if (closestEnemy) {
        tower.fire(now);
        const config = TOWER_TYPES[tower.towerType];
        const projNode = new Node('projectile');
        const proj = projNode.addComponent(Projectile);
        const towerPos = tower.node.getPosition();
        const targetPos = closestEnemy.node.getPosition();
        proj.init({
          x: towerPos.x,
          y: towerPos.y,
          targetNode: closestEnemy.node,
          damage: tower.damage,
          speed: config.projectileSpeed,
          type: tower.towerType,
          aoeRadius: config.aoeRadius,
          slowEffect: config.slowEffect,
        });
        this.entityNode!.addChild(projNode);
        this.projectiles.push(proj);
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const stillMoving = proj.update(dtSec);

      if (!stillMoving) {
        if (proj.aoeRadius > 0) {
          for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const nodePos = enemy.node.getPosition();
            const projPos = proj.node.getPosition();
            const dx = nodePos.x - projPos.x;
            const dy = nodePos.y - projPos.y;
            if (Math.sqrt(dx * dx + dy * dy) < proj.aoeRadius) {
              const dead = enemy.takeDamage(proj.damage);
              if (dead && this.economy && this.waveManager) {
                const reward = this.economy.killReward(enemy.reward, this.waveManager.currentWave);
                this.economy.earn(reward);
                this.totalKills++;
                this.audio?.play('enemyDeath');
                const ePos = enemy.node.getPosition();
                this.spawnFloatingText(ePos.x, ePos.y, `+${reward}`);
              }
            }
          }
        } else if (proj.targetNode && proj.targetNode.isValid) {
          const targetEnemy = this.enemies.find(e => e.node === proj.targetNode);
          if (targetEnemy && targetEnemy.alive) {
            const dead = targetEnemy.takeDamage(proj.damage);
            if (dead && this.economy && this.waveManager) {
              const reward = this.economy.killReward(targetEnemy.reward, this.waveManager.currentWave);
              this.economy.earn(reward);
              this.totalKills++;
              this.audio?.play('enemyDeath');
              const ePos = targetEnemy.node.getPosition();
              this.spawnFloatingText(ePos.x, ePos.y, `+${reward}`);
            }
            if (proj.slowEffect) {
              targetEnemy.applySlow(proj.slowEffect.duration, proj.slowEffect.factor);
            }
          }
        }

        proj.node.destroy();
        this.projectiles.splice(i, 1);
      }
    }

    if (this.economy && this.waveManager) {
      this.hud?.update(this.economy.gold, this.economy.lives, this.waveManager.currentWave, this.waveManager.totalWaves);
      this.towerSelectBar?.updateAffordability(this.economy);
      if (this.state === 'prepare') this.towerSelectBar?.updateTimer(this.prepareTimer);
    }
  }

  // Tower select bar callbacks
  onTowerSelect(type: TowerType): void {
    if (this.state !== 'prepare') return;
    if (this.selectedTower) {
      this.selectedTower.showRange(false);
      this.selectedTower = null;
    }
    this.selectedTowerType = this.selectedTowerType === type ? null : type;
    this.towerSelectBar?.setSelectedType(this.selectedTowerType);
  }

  private upgradeSelectedTower(): void {
    if (!this.selectedTower || !this.economy) return;
    const cost = this.selectedTower.getUpgradeCost();
    if (!this.economy.canAfford(cost)) {
      const p = this.selectedTower.node.getPosition();
      this.spawnFloatingText(p.x, p.y, 'No gold', '#ff5252');
      return;
    }
    this.economy.spend(cost);
    this.selectedTower.upgrade();
    this.audio?.play('towerUpgrade');
    const p = this.selectedTower.node.getPosition();
    this.towerInfoPanel?.show(p.x, p.y, this.selectedTower.towerType, this.selectedTower.level, this.selectedTower.damage, this.selectedTower.range);
    this.spawnFloatingText(p.x, p.y, `-${cost}`, '#ff5252');
  }

  private sellSelectedTower(): void {
    if (!this.selectedTower || !this.economy) return;
    const refund = this.selectedTower.getSellValue();
    this.economy.earn(refund);
    const idx = this.towers.indexOf(this.selectedTower);
    if (idx >= 0) this.towers.splice(idx, 1);
    this.selectedTower.showRange(false);
    this.selectedTower.node.destroy();
    this.selectedTower = null;
    this.towerInfoPanel?.hide();
    this.audio?.play('towerSell');
  }

  private spawnFloatingText(x: number, y: number, message: string, color: string = '#ffd700'): void {
    const ftNode = new Node('floatingText');
    ftNode.addComponent(UITransform);
    const ft = ftNode.addComponent(FloatingText);
    this.uiNode?.addChild(ftNode);
    ft.init(x, y, message, color);
  }

  getSelectedTowerType(): TowerType | null {
    return this.selectedTowerType;
  }

  getState(): string {
    return this.state;
  }

  getPrepareTimer(): number {
    return this.prepareTimer;
  }

  getWaveManager(): WaveManager | null {
    return this.waveManager;
  }

  getEconomy(): Economy | null {
    return this.economy;
  }

  getTowers(): Tower[] {
    return this.towers;
  }
}
