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

    // Tower arrow — layered circles with highlight
    gfx.fillStyle(0x0288d1, 1);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0x4fc3f7, 1);
    gfx.fillCircle(14, 13, 9);
    gfx.fillStyle(0xb3e5fc, 0.6);
    gfx.fillCircle(12, 10, 5);
    gfx.fillStyle(0xffffff, 0.3);
    gfx.fillCircle(10, 8, 3);
    gfx.lineStyle(2, 0x01579b, 0.8);
    gfx.strokeCircle(16, 16, 14);
    gfx.generateTexture('tower_arrow', 32, 32);
    gfx.clear();

    // Tower cannon — heavy body with barrel
    gfx.fillStyle(0xbf360c, 1);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0xd84315, 1);
    gfx.fillCircle(14, 14, 10);
    gfx.fillStyle(0xff7043, 1);
    gfx.fillRect(12, 6, 8, 18);
    gfx.fillStyle(0xffab91, 0.5);
    gfx.fillRect(13, 8, 3, 10);
    gfx.lineStyle(2, 0x3e2723, 0.8);
    gfx.strokeCircle(16, 16, 14);
    gfx.generateTexture('tower_cannon', 32, 32);
    gfx.clear();

    // Tower frost — ice crystal shape
    gfx.fillStyle(0x0288d1, 1);
    gfx.fillCircle(16, 16, 14);
    gfx.fillStyle(0x4fc3f7, 1);
    gfx.fillCircle(16, 16, 10);
    gfx.fillStyle(0x81d4fa, 1);
    gfx.fillCircle(16, 14, 7);
    gfx.fillStyle(0xe1f5fe, 0.7);
    gfx.fillCircle(14, 11, 4);
    gfx.fillStyle(0xffffff, 0.4);
    gfx.fillCircle(12, 9, 2);
    gfx.lineStyle(2, 0x01579b, 0.8);
    gfx.strokeCircle(16, 16, 14);
    gfx.generateTexture('tower_frost', 32, 32);
    gfx.clear();

    // Projectile arrow — small bright bolt
    gfx.fillStyle(0xffee58, 1);
    gfx.fillCircle(4, 4, 3);
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(3, 3, 1);
    gfx.generateTexture('projectile_arrow', 8, 8);
    gfx.clear();

    // Projectile cannon — larger explosive shell
    gfx.fillStyle(0xff5722, 1);
    gfx.fillCircle(6, 6, 5);
    gfx.fillStyle(0xff8a65, 0.6);
    gfx.fillCircle(5, 4, 3);
    gfx.fillStyle(0xffccbc, 0.4);
    gfx.fillCircle(4, 3, 1);
    gfx.generateTexture('projectile_cannon', 12, 12);
    gfx.clear();

    // Projectile frost — ice shard
    gfx.fillStyle(0x4fc3f7, 1);
    gfx.fillCircle(4, 4, 3);
    gfx.fillStyle(0xe1f5fe, 0.7);
    gfx.fillCircle(3, 3, 1);
    gfx.generateTexture('projectile_frost', 8, 8);
    gfx.clear();

    // Enemy basic — round red blob with eyes
    gfx.fillStyle(0xc0392b, 1);
    gfx.fillCircle(12, 12, 12);
    gfx.fillStyle(0xe74c3c, 1);
    gfx.fillCircle(11, 10, 9);
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(8, 9, 2);
    gfx.fillCircle(14, 9, 2);
    gfx.fillStyle(0xffffff, 0.7);
    gfx.fillCircle(8.5, 8.5, 0.8);
    gfx.fillCircle(14.5, 8.5, 0.8);
    gfx.generateTexture('enemy_basic', 24, 24);
    gfx.clear();

    // Enemy fast — triangular speed shape
    gfx.fillStyle(0xe65100, 1);
    gfx.fillTriangle(12, 2, 22, 22, 2, 22);
    gfx.fillStyle(0xf39c12, 1);
    gfx.fillTriangle(12, 5, 18, 19, 6, 19);
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(10, 12, 1.5);
    gfx.fillCircle(14, 12, 1.5);
    gfx.generateTexture('enemy_fast', 24, 24);
    gfx.clear();

    // Enemy tank — heavy rounded square
    gfx.fillStyle(0x4a148c, 1);
    gfx.fillRoundedRect(2, 2, 20, 20, 4);
    gfx.fillStyle(0x6a1b9a, 1);
    gfx.fillRoundedRect(4, 4, 16, 16, 3);
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(9, 11, 2);
    gfx.fillCircle(15, 11, 2);
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillCircle(9.5, 10.5, 0.7);
    gfx.fillCircle(15.5, 10.5, 0.7);
    gfx.lineStyle(2, 0x311b92, 0.8);
    gfx.strokeRoundedRect(2, 2, 20, 20, 4);
    gfx.generateTexture('enemy_tank', 24, 24);
    gfx.clear();

    // HP bar background
    gfx.fillStyle(0x333333, 1);
    gfx.fillRect(0, 0, 24, 4);
    gfx.generateTexture('hp_bg', 24, 4);
    gfx.clear();

    // HP bar fill
    gfx.fillStyle(0x4caf50, 1);
    gfx.fillRect(0, 0, 24, 4);
    gfx.generateTexture('hp_fill', 24, 4);
    gfx.clear();

    gfx.destroy();
  }
}
