export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    const obj = this.pool.pop();
    if (obj) {
      this.resetFn(obj);
      return obj;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  get size(): number {
    return this.pool.length;
  }
}
