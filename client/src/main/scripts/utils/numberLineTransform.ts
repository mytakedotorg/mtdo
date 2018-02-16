/**
 * Transforms one number-line onto another, possibly flipping it, always clipping it.
 */
export default class NumberLineTransform {
  private x0: number;
  private x1: number;

  private xMin: number;
  private xMax: number;

  private y0: number;
  private y1: number;

  private yMin: number;
  private yMax: number;

  setBefore(x0: number, x1: number) {
    this.x0 = x0;
    this.x1 = x1;
    this.xMin = Math.min(x0, x1);
    this.xMax = Math.max(x0, x1);
  }

  getBeforeSize(): number {
    return this.xMax - this.xMin;
  }

  setAfter(y0: number, y1: number) {
    this.y0 = y0;
    this.y1 = y1;
    this.yMin = Math.min(y0, y1);
    this.yMax = Math.max(y0, y1);
  }

  getAfterSize(): number {
    return this.yMax - this.yMin;
  }

  toAfter(x: number): number {
    const y =
      this.y0 + (this.y1 - this.y0) * (x - this.x0) / (this.x1 - this.x0);
    return Math.min(this.yMax, Math.max(this.yMin, y));
  }

  toBefore(y: number): number {
    const x =
      this.x0 + (this.x1 - this.x0) * (y - this.y0) / (this.y1 - this.y0);
    return Math.min(this.xMax, Math.max(this.xMin, x));
  }
}
