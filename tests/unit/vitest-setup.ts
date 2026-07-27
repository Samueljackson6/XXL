// Vitest setup: mock Cocos Creator 'cc' module and browser globals

const mockColor = class Color {
  constructor(r: number, g: number, b: number, a: number = 255) {
    this.r = r; this.g = g; this.b = b; this.a = a;
  }
  static hex(hex: string) {
    const val = hex.replace('#', '');
    const r = parseInt(val.substring(0, 2), 16);
    const g = parseInt(val.substring(2, 4), 16);
    const b = parseInt(val.substring(4, 6), 16);
    return new Color(r, g, b, 255);
  }
};

const mockVec3 = class Vec3 {
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
};

const mockUITransform = class UITransform {
  setContentSize(_w: number, _h: number) {}
};

const mockNode = class Node {
  constructor(name?: string) { this.name = name; }
  addComponent(_cls: any) { return null; }
  getComponent(_cls: any) { return null; }
  setPosition(_x: number, _y: number, _z: number) {}
  addChild(_child: any) {}
  removeChild(_child: any) {}
  destroy() {}
  get active() { return true; }
  set active(_v: boolean) {}
  get isValid() { return true; }
  get position() { return new mockVec3(); }
};

const mockComponent = class Component {
  node = new mockNode();
  onLoad() {}
  update(_dt: number) {}
  destroy() {}
};

const mockEventTouch = class EventTouch {
  on(_event: string, _fn: Function, _ctx?: any) {}
  getUILocation() { return { x: 0, y: 0 }; }
};

const mockInput = {
  EventType: { TOUCH_END: 'touch-end' },
  on(_event: string, _fn: Function, _ctx?: any) {},
  off(_event: string, _fn: Function, _ctx?: any) {},
};

const mockSprite = class Sprite {
  color = mockColor(255, 255, 255, 255);
  node = new mockNode();
};

const mockLabel = class Label {
  string = '';
  fontSize = 16;
  lineHeight = 18;
  color = mockColor(255, 255, 255, 255);
  node = new mockNode();
};

const mockGraphics = class Graphics {
  clear() {}
  rect(_x: number, _y: number, _w: number, _h: number) {}
  circle(_x: number, _y: number, _r: number) {}
  moveTo(_x: number, _y: number) {}
  lineTo(_x: number, _y: number) {}
  fillColor = mockColor(0, 0, 0, 255);
  strokeColor = mockColor(0, 0, 0, 255);
  lineWidth = 1;
  fill() {}
  stroke() {}
};

const mockDecorator = {
  ccclass: (_name: string) => () => {},
  property: () => () => {},
};

const mockCC = {
  _decorator: mockDecorator,
  Component: mockComponent,
  Node: mockNode,
  Sprite: mockSprite,
  Graphics: mockGraphics,
  Label: mockLabel,
  Color: mockColor,
  Vec3: mockVec3,
  UITransform: mockUITransform,
  EventTouch: mockEventTouch,
  input: mockInput,
  Input: { EventType: mockInput.EventType },
};

(globalThis as any).cc = mockCC;
(globalThis as any)._decorator = mockDecorator;
