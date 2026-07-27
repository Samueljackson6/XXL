// Minimal Phaser mock for Node.js test environment
export const AUTO = 0;
export const CENTER_BOTH = 0;
export const FIT = 0;
export const Scene = class {
  constructor() { }
  scene = { start: () => {} };
  registry = { get: () => undefined, set: () => {} };
  add = {
    text: () => ({ setOrigin: () => ({}), setInteractive: () => ({}), setDepth: () => ({}), setVisible: () => ({}), setStyle: () => ({}), setAlpha: () => ({}), setScale: () => ({}), on: () => ({}), setText: () => ({}), setX: () => ({}), setTint: () => ({}), clearTint: () => ({}), setFillStyle: () => ({}), setStrokeStyle: () => ({}), destroy: () => {}, add: () => ({}) }),
    graphics: () => ({ fillStyle: () => ({}), fillRect: () => ({}), lineStyle: () => ({}), strokeRect: () => ({}), beginPath: () => ({}), moveTo: () => ({}), lineTo: () => ({}), strokePath: () => ({}), clear: () => ({}), fillCircle: () => ({}), strokeCircle: () => ({}), setDepth: () => ({}), setVisible: () => ({}), fillRoundedRect: () => ({}), strokeRoundedRect: () => ({}), fillTriangle: () => ({}), setScale: () => ({}), setAlpha: () => ({}) }),
    container: () => ({ add: () => ({}), setDepth: () => ({}), x: 0, y: 0 }),
    rectangle: () => ({ setInteractive: () => ({}), setStrokeStyle: () => ({}), setAlpha: () => ({}), setFillStyle: () => ({}), on: () => ({}), setScale: () => ({}), setSize: () => ({}), add: () => ({}), destroy: () => {} }),
    sprite: () => ({ setScale: () => ({}), setOrigin: () => ({}), setTint: () => ({}), clearTint: () => ({}), setX: () => ({}), setAlpha: () => ({}), setTexture: () => ({}), setDepth: () => ({}), destroy: () => {} }),
    existing: () => ({}),
  };
  input = { on: () => {} };
  time = { delayedCall: () => ({}) };
  tweens = { add: () => ({}) };
  events = { once: () => {} };
};
export const Types = { Core: { GameConfig: {} } };
export const Input = { Pointer: class {} };
export const GameObjects = {
  Container: class {},
  Graphics: class {},
  Text: class {
    setOrigin() { return this; }
    setInteractive() { return this; }
    setDepth() { return this; }
    setVisible() { return this; }
    setStyle() { return this; }
    setAlpha() { return this; }
    setScale() { return this; }
    on() { return this; }
    setText() { return this; }
    setX() { return this; }
    setTint() { return this; }
    clearTint() { return this; }
    setFillStyle() { return this; }
    setStrokeStyle() { return this; }
    destroy() {}
    add() { return this; }
  },
  Rectangle: class {
    setInteractive() { return this; }
    setStrokeStyle() { return this; }
    setAlpha() { return this; }
    setFillStyle() { return this; }
    on() { return this; }
    setScale() { return this; }
    setSize() { return this; }
    add() { return this; }
    destroy() {}
  },
  Sprite: class {
    setScale() { return this; }
    setOrigin() { return this; }
    setTint() { return this; }
    clearTint() { return this; }
    setX() { return this; }
    setAlpha() { return this; }
    setTexture() { return this; }
    setDepth() { return this; }
    destroy() {}
  },
};
export const Tweens = { Sine: { easeInOut: 'Sine.easeInOut' }, Back: { easeOut: 'Back.easeOut' }, Cubic: { easeOut: 'Cubic.easeOut' } };
export const Game = class {
  canvas = { getContext: () => null, parentElement: null, width: 400, height: 700 };
  events = { once: () => {} };
};
