/**
 * Minimal browser-API stubs for WeChat Mini Game environment.
 * Phaser 3 expects browser globals that don't exist in the mini-game runtime.
 * Uses plain functions (not classes) to avoid Babel $__classCallCheck issues.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as Record<string, any>;

function createStub(_name: string) {
  return function() {} as unknown as typeof Object;
}

if (typeof g.HTMLVideoElement === 'undefined') { g.HTMLVideoElement = createStub('HTMLVideoElement'); }
if (typeof g.HTMLCanvasElement === 'undefined') { g.HTMLCanvasElement = createStub('HTMLCanvasElement'); }
if (typeof g.HTMLImageElement === 'undefined') { g.HTMLImageElement = createStub('HTMLImageElement'); }
if (typeof g.AudioContext === 'undefined' && typeof g.webkitAudioContext === 'undefined') {
  g.AudioContext = createStub('AudioContext');
}
if (typeof g.XMLHttpRequest === 'undefined') { g.XMLHttpRequest = createStub('XMLHttpRequest'); }
if (typeof g.WebSocket === 'undefined') { g.WebSocket = function() {} as any; }
if (typeof g.Image === 'undefined') { g.Image = createStub('Image'); }
if (typeof g.HTMLAudioElement === 'undefined') { g.HTMLAudioElement = createStub('HTMLAudioElement'); }

if (typeof g.navigator === 'undefined') {
  g.navigator = { maxTouchPoints: 0, platform: 'WeChat MiniGame' };
}
if (typeof g.location === 'undefined') {
  g.location = { href: '', protocol: 'https:', host: 'localhost' };
}
if (typeof g.screen === 'undefined') {
  g.screen = { width: 400, height: 700, availWidth: 400, availHeight: 700 };
}
if (typeof g.performance === 'undefined') {
  g.performance = { now: () => Date.now() };
}
if (typeof g.CSS === 'undefined') {
  g.CSS = {};
}

if (typeof g.document === 'undefined') {
  g.document = { body: {}, documentElement: {} };
}
if (typeof g.window === 'undefined') {
  g.window = g;
}
