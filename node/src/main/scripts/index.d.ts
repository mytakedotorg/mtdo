/*
 * MyTake.org website and tooling.
 * Copyright (C) 2019-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
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

declare namespace jest {
  interface Matchers<R> {
    toMatchImageSnapshot(): CustomMatcherResult;
    toMatchImageSnapshot(diffConfig: any): CustomMatcherResult;
  }
}
