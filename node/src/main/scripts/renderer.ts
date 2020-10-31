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
import { launch, Viewport, Page, Browser } from "puppeteer";
import { DIM_OG, DIM_TWITTER } from "./common/social/SocialHeaderTemplate";
import { createPool, Options, Pool } from "generic-pool";

function pathToTemplate(): string {
  const TARGET = "node/build/dist-client/socialEmbed.html";
  const SRC = "node/src/main/scripts";
  const DIST = "node/build/dist";
  if (__dirname.endsWith(DIST)) {
    return __dirname.slice(0, -DIST.length) + TARGET;
  } else if (__dirname.endsWith(SRC)) {
    return __dirname.slice(0, -SRC.length) + TARGET;
  } else {
    throw "Unhandled directory " + __dirname;
  }
}

export type AspectRatio = "twitter" | "facebook";

const arToViewport: Record<AspectRatio, Viewport> = {
  twitter: {
    width: DIM_TWITTER[0] / 2,
    height: DIM_TWITTER[1] / 2,
    deviceScaleFactor: 2,
  },
  facebook: {
    width: DIM_OG[0] / 2,
    height: DIM_OG[1] / 2,
    deviceScaleFactor: 2,
  },
};

export class RenderQueue {
  static warmup(numTabs = 2, delayMs = 5): Promise<RenderQueue> {
    if (!this.instance) {
      this.instance = new RenderQueue().init(numTabs, delayMs);
    }
    return this.instance;
  }

  static async render(socialRison: string, ar: AspectRatio): Promise<Buffer> {
    const queue = await this.warmup();
    return queue.renderOne(socialRison, ar);
  }

  static async shutdown(): Promise<void> {
    if (this.instance) {
      const queue = await this.instance;
      await queue.pool.drain();
      await queue.pool.clear();
      await queue.browser.close();
      this.instance = undefined;
    }
  }

  browser: Browser;
  delayMs: number;
  pool: Pool<Page>;

  private async init(numTabs: number, delayMs: number): Promise<RenderQueue> {
    this.delayMs = delayMs;
    /** https://github.com/coopernurse/node-pool#createpool */
    const pagePoolOptions: Options = {
      max: numTabs,
      min: numTabs,
    };
    this.browser = await launch({
      args: ["--no-sandbox", "--disable-web-security"],
    });
    this.pool = createPool(
      {
        create: async () => {
          const page = await this.browser.newPage();
          await page.goto("file://" + pathToTemplate());
          return page;
        },
        destroy: async (page) => {
          await page.close();
        },
      },
      pagePoolOptions
    );
    return this;
  }

  private async renderOne(
    socialRison: string,
    ar: AspectRatio
  ): Promise<Buffer> {
    const page = await this.pool.acquire();
    try {
      await page.setViewport(arToViewport[ar]);

      const blocker = new Blocker<string>();
      page.on("console", (msg) => {
        blocker.set(msg.text());
      });

      await page.evaluate((arg) => {
        (window as any).render(arg);
      }, socialRison);

      const consoleMsg = await blocker.get();
      if (consoleMsg !== socialRison) {
        throw `Expected ${socialRison} but was ${consoleMsg}`;
      }
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      const buffer = await page.screenshot({
        encoding: "binary",
        type: "png",
        fullPage: false,
      });
      page.removeAllListeners();
      this.pool.release(page);
      return buffer;
    } catch (err) {
      page.removeAllListeners();
      this.pool.destroy(page);
      throw err;
    }
  }

  static instance?: Promise<RenderQueue>;
}

class Blocker<T> {
  promise: Promise<T>;
  resolver: (arg: T) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolver = resolve;
    });
  }

  set(arg: T): void {
    this.resolver(arg);
  }

  get(): Promise<T> {
    return this.promise;
  }
}
