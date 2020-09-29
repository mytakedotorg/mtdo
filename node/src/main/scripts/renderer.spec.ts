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
import { RenderQueue } from "./renderer";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { imgDiffCfg } from "./testCfg";

expect.extend({ toMatchImageSnapshot });

test("render single videoCut", async (done) => {
  const buffer = await RenderQueue.render(
    "~cut:(2007.9000244140625,2046.1099853515625),fact:E74aoUY=31c55b20cc10bdfe9b10ce1fbc3d9b3f3bf01098,kind:videoCut",
    "facebook"
  );
  expect(buffer).toMatchImageSnapshot(imgDiffCfg);
  done();
});

test("render bad videoCut", async (done) => {
  expect.assertions(1);
  try {
    await RenderQueue.render(
      "~cut:(2007.9000244140625,2046.1099853515625),fact:E74aoUY=31c75b20cc10bdfe9b10ce1fbc3d9b3f3bf01098,kind:videoCut",
      "facebook"
    );
  } catch (err) {
    expect(err).toMatchSnapshot();
  }
  done();
});

test("render multiple videoCut", async (done) => {
  // search cuba, and grab the first clip from each debate
  const toRender = [
    "~cut:(126.6500015258789,143.9080047607422),fact:E74aoUY=a474ae4ad13f23d65adfe1dab1b08dbad93aaca9,kind:videoCut",
    "~cut:(1160.0799560546875,1171.5899658203125),fact:E74aoUY=2800243f94261dc6b850e78e05e139c64b590c39,kind:videoCut",
    "~cut:(666.4299926757812,679.3599853515625),fact:E74aoUY=44e8653d9041525dc9300dec6ec3a0842bd8151c,kind:videoCut",
    "~cut:(4725.0498046875,4796.17919921875),fact:E74aoUY=5d6720abf4fb5e1e6d2d6ff48e0b5b8103096d84,kind:videoCut",
    "~cut:(322.2699890136719,344.3800048828125),fact:E74aoUY=7bacba0463e8d70c604704bbb4f1a44110bffc0a,kind:videoCut",
    "~cut:(2409.35009765625,2416.639892578125),fact:E74aoUY=822ad8fc57b4a1591bac01adbd68996e1ee9ba77,kind:videoCut",
    "~cut:(80.46900177001953,113.04000091552734),fact:E74aoUY=38881d91c3201cbfe89f4f3be3ffee3dcc62d4a8,kind:videoCut",
  ];
  const promises = toRender.map((rison) =>
    RenderQueue.render(rison, "facebook")
  );
  const buffers = await Promise.all(promises);
  for (let buffer of buffers) {
    expect(buffer).toMatchImageSnapshot(imgDiffCfg);
  }
  done();
});

afterAll(() => {
  RenderQueue.shutdown();
});
