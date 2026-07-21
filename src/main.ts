import * as Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isWx = typeof (globalThis as any).wx !== 'undefined';

if (!isWx || !(globalThis as any).__phaserGame) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__phaserGame = true;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__game = game;

  if (!isWx) {
    game.events.once('ready', () => {
      const canvas = game.canvas;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const app = (document as any).getElementById('app');
      if (app && canvas && canvas.parentElement !== app) {
        app.appendChild(canvas);
      }
    });
  }
}
