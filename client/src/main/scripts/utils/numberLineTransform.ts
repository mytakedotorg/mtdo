/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
export default class NumberLineTransform {
  /** Transforms one number-line onto another, possibly flipping it, always clipping it. */
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
      this.y0 + ((this.y1 - this.y0) * (x - this.x0)) / (this.x1 - this.x0);
    return Math.min(this.yMax, Math.max(this.yMin, y));
  }

  toBefore(y: number): number {
    const x =
      this.x0 + ((this.x1 - this.x0) * (y - this.y0)) / (this.y1 - this.y0);
    return Math.min(this.xMax, Math.max(this.xMin, x));
  }
}
