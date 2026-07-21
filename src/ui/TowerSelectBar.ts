import * as Phaser from 'phaser';
import { GAME_HEIGHT, TOWER_TYPES } from '../utils/config';
import { type TowerType } from '../entities/Tower';

export class TowerSelectBar {
  private scene: Phaser.Scene;

  onSelect: ((type: TowerType) => void) | null = null;
  onStartWave: (() => void) | null = null;

  private buttonEls: HTMLElement[] = [];
  private startBtnEl!: HTMLElement;
  private rootEl!: HTMLElement;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    const GAME_WIDTH = 400;
    const gameCanvas = this.scene.game.canvas;

    this.rootEl = document.createElement('div');
    this.rootEl.style.cssText = `position:fixed;left:0;bottom:0;width:100%;height:70px;display:flex;align-items:center;justify-content:center;gap:12px;pointer-events:auto;z-index:100;background:rgba(0,0,0,0.7);`;
    document.body.appendChild(this.rootEl);

    const types: TowerType[] = ['arrow', 'cannon', 'frost'];
    for (const type of types) {
      const config = TOWER_TYPES[type];
      const btn = document.createElement('div');
      btn.style.cssText = `display:flex;flex-direction:column;align-items:center;justify-content:center;width:80px;height:54px;background:rgba(51,51,51,0.9);border:2px solid #${config.color.toString(16).padStart(6,'0')};border-radius:10px;cursor:pointer;`;
      btn.innerHTML = `<span style="color:#fff;font-size:14px;font-family:Arial,sans-serif">${config.name}</span><span style="color:#ffd700;font-size:12px;font-family:Arial,sans-serif">${config.cost}💰</span>`;
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.onSelect) this.onSelect(type);
      });
      this.rootEl.appendChild(btn);
      this.buttonEls.push(btn);
    }

    this.startBtnEl = document.createElement('div');
    this.startBtnEl.style.cssText = `width:70px;height:34px;background:rgba(76,175,80,0.9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-family:Arial,sans-serif;cursor:pointer;margin-left:16px;`;
    this.startBtnEl.textContent = '开始';
    this.startBtnEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.onStartWave) this.onStartWave();
    });
    this.rootEl.appendChild(this.startBtnEl);

    this.updateStartWaveVisibility(false);
  }

  updateStartWaveVisibility(show: boolean): void {
    if (this.startBtnEl) this.startBtnEl.style.display = show ? '' : 'none';
  }

  destroy(): void {
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
  }
}
