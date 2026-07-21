export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;

export const TILE_SIZE = 64;
export const GRID_COLS = Math.floor(GAME_WIDTH / TILE_SIZE);
export const GRID_ROWS = Math.floor(GAME_HEIGHT / TILE_SIZE);

export const PLAYER_LIVES = 20;
export const STARTING_GOLD = 150;

export const PATH_POINTS = [
  { x: 0, y: 1 },
  { x: 3, y: 1 },
  { x: 3, y: 4 },
  { x: 6, y: 4 },
  { x: 6, y: 2 },
  { x: 8, y: 2 },
  { x: 8, y: 6 },
  { x: 4, y: 6 },
  { x: 4, y: 8 },
  { x: GAME_WIDTH / TILE_SIZE, y: 8 },
];

export const TOWER_TYPES = {
  arrow: {
    name: '箭塔',
    cost: 50,
    range: 120,
    damage: 10,
    fireRate: 600,
    color: 0x4fc3f7,
    description: '快速射击，伤害一般',
  },
  cannon: {
    name: '炮塔',
    cost: 100,
    range: 150,
    damage: 30,
    fireRate: 1200,
    color: 0xff7043,
    description: '高伤害，攻速慢',
  },
  frost: {
    name: '减速塔',
    cost: 80,
    range: 130,
    damage: 5,
    fireRate: 800,
    color: 0x81d4fa,
    description: '减速敌人，持续伤害',
  },
} as const;

export const ENEMY_TYPES = {
  basic: { hp: 30, speed: 80, reward: 10, color: 0xe74c3c },
  fast: { hp: 20, speed: 140, reward: 15, color: 0xf39c12 },
  tank: { hp: 100, speed: 50, reward: 30, color: 0x8e44ad },
} as const;
