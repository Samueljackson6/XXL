export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const HUD_HEIGHT = 44;
export const TILE_SIZE = 64;
export const GRID_COLS = Math.floor(GAME_WIDTH / TILE_SIZE);
export const GRID_ROWS = Math.floor((GAME_HEIGHT - HUD_HEIGHT) / TILE_SIZE);

export const PLAYER_LIVES = 20;

export const PATH_POINTS: { x: number; y: number }[] = [
  { x: 0, y: 1 },
  { x: 3, y: 1 },
  { x: 3, y: 4 },
  { x: 5, y: 4 },
  { x: 5, y: 2 },
  { x: 5, y: 6 },
  { x: 4, y: 6 },
  { x: 4, y: 8 },
  { x: 6, y: 8 },
];

export const TOWER_TYPES = {
  arrow: {
    name: '箭塔',
    cost: 50,
    range: 140,
    damage: 12,
    fireRate: 500,
    color: 0x4fc3f7,
    projectileSpeed: 350,
    aoeRadius: 0,
    slowEffect: null as { duration: number; factor: number } | null,
    description: '快速射击，伤害一般',
  },
  cannon: {
    name: '炮塔',
    cost: 100,
    range: 160,
    damage: 35,
    fireRate: 1200,
    color: 0xff7043,
    projectileSpeed: 250,
    aoeRadius: 40,
    slowEffect: null as { duration: number; factor: number } | null,
    description: '高伤害AOE，攻速慢',
  },
  frost: {
    name: '减速塔',
    cost: 80,
    range: 130,
    damage: 8,
    fireRate: 700,
    color: 0x81d4fa,
    projectileSpeed: 200,
    aoeRadius: 0,
    slowEffect: { duration: 2000, factor: 0.5 } as { duration: number; factor: number } | null,
    description: '减速敌人，持续伤害',
  },
} as const;

export const ENEMY_TYPES = {
  basic: { hp: 40, speed: 90, reward: 10, color: 0xe74c3c, hitRadius: 12 },
  fast: { hp: 25, speed: 160, reward: 15, color: 0xf39c12, hitRadius: 10 },
  tank: { hp: 120, speed: 55, reward: 30, color: 0x8e44ad, hitRadius: 16 },
} as const;

export const ECONOMY_CONFIG = {
  startingGold: 200,
  startingLives: 20,
  killRewardMultiplier: 0.05,
  waveBonusBase: 30,
  waveBonusPerWave: 5,
  sellRatio: 0.5,
};

export const WAVE_CONFIG = {
  totalWaves: 30,
  prepareTime: 15,
  intermissionTime: 5,
  baseCount: 5,
  countPerWave: 2,
  spawnInterval: 800,
};
