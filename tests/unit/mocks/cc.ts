// Cocos Creator 'cc' module mock for Vitest
export const _decorator = {
  ccclass: (_name: string) => () => {},
  property: () => () => {},
};

export class Component {
  node = new Node();
  onLoad() {}
  update(_dt: number) {}
  destroy() {}
}

export class Node {
  name: string;
  constructor(name?: string) { this.name = name || 'node'; }
  addComponent(_cls: any) { return null; }
  getComponent(_cls: any) { return null; }
  setPosition(_x: number, _y: number, _z: number) {}
  addChild(_child: any) {}
  removeChild(_child: any) {}
  destroy() {}
  get active() { return true; }
  set active(_v: boolean) {}
  get isValid() { return true; }
  get position() { return new Vec3(); }
}

export class Sprite {
  color = new Color(255, 255, 255, 255);
  node = new Node();
}

export class Label {
  string = '';
  fontSize = 16;
  lineHeight = 18;
  color = new Color(255, 255, 255, 255);
  node = new Node();
}

export class Graphics {
  clear() {}
  rect(_x: number, _y: number, _w: number, _h: number) {}
  circle(_x: number, _y: number, _r: number) {}
  moveTo(_x: number, _y: number) {}
  lineTo(_x: number, _y: number) {}
  fillColor = new Color(0, 0, 0, 255);
  strokeColor = new Color(0, 0, 0, 255);
  lineWidth = 1;
  fill() {}
  stroke() {}
}

export class Color {
  r: number; g: number; b: number; a: number;
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
  static WHITE = new Color(255, 255, 255, 255);
}

export class Vec3 {
  x: number; y: number; z: number;
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
}

export class UITransform {
  setContentSize(_w: number, _h: number) {}
}

export class EventTouch {
  on(_event: string, _fn: Function, _ctx?: any) {}
  getUILocation() { return { x: 0, y: 0 }; }
}

export const input = {
  on(_event: string, _fn: Function, _ctx?: any) {},
  off(_event: string, _fn: Function, _ctx?: any) {},
};

export namespace Input {
  export const EventType = {
    TOUCH_END: 'touch-end',
  };
}
