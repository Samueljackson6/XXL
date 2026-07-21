export const WAVE_STATE = {
  IDLE: 'IDLE',
  PREPARE: 'PREPARE',
  FIGHTING: 'FIGHTING',
  INTERMISSION: 'INTERMISSION',
  VICTORY: 'VICTORY',
  GAME_OVER: 'GAME_OVER',
} as const;

export type WaveState = (typeof WAVE_STATE)[keyof typeof WAVE_STATE];
