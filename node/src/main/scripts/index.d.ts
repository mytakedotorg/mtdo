declare module "react" {
  type DetailedReactHTMLElement<T, U> = any;
  type ReactNode = any;
  function createElement(
    element: string,
    attributes: any,
    content: string
  ): HTMLElement;
  export type ReactElement<T> = any;
}
interface CanvasRenderingContext2D {
  readonly canvas: HTMLCanvasElement;
  font: string;
  scale(x: number, y: number): void;
  fillStyle: string;
  fillRect(x: number, y: number, w: number, h: number): void;
  drawImage(image: HTMLImageElement, dx: number, dy: number): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
}

interface HTMLCanvasElement {
  height: number;
  width: number;
  getContext(contextId: "2d"): CanvasRenderingContext2D | null;
  readonly style: CSSStyleDeclaration;
  toDataURL(type?: string, quality?: any): string;
}
type CSSStyleDeclaration = any;
type HTMLElement = any;
type HTMLImageElement = any;
type HTMLSpanElement = any;
type TextMetrics = any;

declare namespace jest {
  interface Matchers<R> {
    toMatchImageSnapshot(): CustomMatcherResult;
  }
}
