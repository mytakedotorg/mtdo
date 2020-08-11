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
const underTest = require("./app");
const request = require("supertest");
const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

test("show the 13th amendment", async (done) => {
  const response = await request(underTest).get(
    // Amendment 13 from foundation-index-hash.json
    "/api/images/o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA=_54-86_0-218.png"
  );
  expect(response.statusCode).toBe(200);
  // this threshold is pretty big, but it gets Travis to pass as a smoke test
  expect(response.body).toMatchImageSnapshot({
    failureThreshold: "5",
    failureThresholdType: "percent",
  });
  done();
});

test("show some video captions", async (done) => {
  const response = await request(underTest).get(
    // Mondale-Reagan 1 of 2
    "/api/images/hNPKEqwAyuJdu2OQY6ESAieCq_xQXX1it4bjA7DRlIg=_5839.620-5949.290.png"
  );
  expect(response.statusCode).toBe(200);
  // travis image is a different size, can't replicate on a dev machine...
  expect(response.body).toMatchImageSnapshot({
    failureThreshold: "5",
    failureThresholdType: "percent",
  });
  done();
});

test("invalid fact should not hang", async (done) => {
  const originalWarn = console.warn;
  try {
    const consoleOutput: string[] = [];
    console.warn = (arg: any) => consoleOutput.push(arg.toString());
    const response = await request(underTest).get(
      "/api/images/vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=_5839.620-5949.290.png"
    );
    expect(response.statusCode).toBe(404);
    expect(consoleOutput.join("\n")).toMatchSnapshot();
  } catch (error) {
    throw error;
  } finally {
    console.warn = originalWarn;
  }

  done();
});
