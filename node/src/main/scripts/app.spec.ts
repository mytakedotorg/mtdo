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
import { expect404, imgDiffCfg } from "./testCfg";
import { RenderQueue } from "./renderer";

expect.extend({ toMatchImageSnapshot });

test("videoCut headers", async (done) => {
  const response = await request(underTest).get(
    "/static/social-header/~cut:(548.906982421875,551.8199951171875),fact:E74aoUY=8ab2602f03abece68fb5d9cc97e48e2b84b568c1,kind:videoCut"
  );
  expect(response.statusCode).toBe(200);
  expect(response.type).toBe("text/plain");
  expect(response.text).toMatchSnapshot();
  done();
});

test("videoCut headers 404 invalid hash", async (done) => {
  expect404(
    "/static/social-header/~cut:(2007.9000244140625,2046.1099853515625),fact:E74aoUY=31c55b20dc10bdfe9b10ce1fbc3d9b3f3bf01098,kind:videoCut",
    done
  );
});

test("videoCut image", async (done) => {
  const response = await request(underTest).get(
    "/static/social-image/~cut:(2007.9000244140625,2046.1099853515625),fact:E74aoUY=31c55b20cc10bdfe9b10ce1fbc3d9b3f3bf01098,kind:videoCut.png"
  );
  expect(response.statusCode).toBe(200);
  expect(response.type).toBe("image/png");
  expect(response.body).toMatchImageSnapshot(imgDiffCfg);
  done();
});

test("videoCut image twitter", async (done) => {
  const response = await request(underTest).get(
    "/static/social-image-twitter/~cut:(2007.9000244140625,2046.1099853515625),fact:E74aoUY=31c55b20cc10bdfe9b10ce1fbc3d9b3f3bf01098,kind:videoCut.png"
  );
  expect(response.statusCode).toBe(200);
  expect(response.type).toBe("image/png");
  expect(response.body).toMatchImageSnapshot(imgDiffCfg);
  done();
});

test("videoCut image 404 invalid hash", async (done) => {
  expect404(
    "/static/social-image/~cut:(2007.9000244140625,2046.1099853515625),fact:E74aoUY=31h5b20cc10bdfe9b10ce1fbc3d9b3f3bf01098,kind:videoCut.png",
    done
  );
});

afterAll(() => {
  RenderQueue.shutdown();
});
