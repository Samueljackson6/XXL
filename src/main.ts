import * as Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';

if (!(window as any).__phaserGame) {
  (window as any).__phaserGame = true;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 400,
    height: 700,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
  };

  const game = new Phaser.Game(config);
  (window as any).__game = game;

  // Place canvas into #app div after creation
  game.events.once('ready', () => {
    const canvas = game.canvas;
    const app = document.getElementById('app');
    if (app && canvas && canvas.parentElement !== app) {
      app.appendChild(canvas);
    }
  });
}
