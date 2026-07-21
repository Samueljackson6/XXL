import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Placeholder: generate simple textures programmatically
    this.createTextures();
  }

  create(): void {
    this.scene.start('MenuScene');
  }

  private createTextures(): void {
    const gfx = this.add.graphics();

    // Tower base (arrow)
    gfx.fillStyle(0x4fc3f7);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0x0288d1);
    gfx.fillCircle(16, 16, 8);
    gfx.generateTexture('tower_arrow', 32, 32);
    gfx.clear();

    // Tower base (cannon)
    gfx.fillStyle(0xff7043);
    gfx.fillCircle(16, 16, 16);
    gfx.fillStyle(0xd84315);
    gfx.fillRect(14, 4, 4, 20);
    gfx.generateTexture('tower_cannon', 32, 32);
    gfx.clear();

    // Tower base (frost)
    gfx.fillStyle(0x81d4fa);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0x4fc3f7);
    gfx.fillCircle(16, 16, 8);
    gfx.generateTexture('tower_frost', 32, 32);
    gfx.clear();

    // Projectile (arrow)
    gfx.fillStyle(0xffee58);
    gfx.fillCircle(4, 4, 3);
    gfx.generateTexture('projectile_arrow', 8, 8);
    gfx.clear();

    // Projectile (cannon)
    gfx.fillStyle(0xff5722);
    gfx.fillCircle(6, 6, 5);
    gfx.generateTexture('projectile_cannon', 12, 12);
    gfx.clear();

    // Projectile (frost)
    gfx.fillStyle(0xb3e5fc);
    gfx.fillCircle(4, 4, 3);
    gfx.generateTexture('projectile_frost', 8, 8);
    gfx.clear();

    // Enemy (basic)
    gfx.fillStyle(0xe74c3c);
    gfx.fillCircle(12, 12, 12);
    gfx.fillStyle(0xc0392b);
    gfx.fillCircle(12, 10, 5);
    gfx.generateTexture('enemy_basic', 24, 24);
    gfx.clear();

    // Enemy (fast)
    gfx.fillStyle(0xf39c12);
    gfx.fillTriangle(12, 2, 22, 22, 2, 22);
    gfx.generateTexture('enemy_fast', 24, 24);
    gfx.clear();

    // Enemy (tank)
    gfx.fillStyle(0x8e44ad);
    gfx.fillRoundedRect(2, 2, 20, 20, 4);
    gfx.fillStyle(0x6a1b9a);
    gfx.fillRoundedRect(5, 5, 14, 14, 3);
    gfx.generateTexture('enemy_tank', 24, 24);
    gfx.clear();

    // HP bar background
    gfx.fillStyle(0x333333);
    gfx.fillRect(0, 0, 24, 4);
    gfx.generateTexture('hp_bg', 24, 4);
    gfx.clear();

    // HP bar fill
    gfx.fillStyle(0x4caf50);
    gfx.fillRect(0, 0, 24, 4);
    gfx.generateTexture('hp_fill', 24, 4);
    gfx.clear();

    gfx.destroy();
  }
}
