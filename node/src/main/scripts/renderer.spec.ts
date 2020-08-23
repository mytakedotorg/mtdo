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
    "cut:!(2007.9000244140625,2046.1099853515625),fact:oZVEQzZXVzx3lM_PbszcA35XYBJxEDHwJirpx1c7hhg=,kind:videoCut",
    "facebook"
  );
  expect(buffer).toMatchImageSnapshot(imgDiffCfg);
  done();
});

test("render bad videoCut", async (done) => {
  expect.assertions(1);
  try {
    await RenderQueue.render(
      "cut:!(2007.9000244140625,2046.1099853515625),fact:OZVEQzZXVzx3lM_PbszcA35XYBJxEDHwJirpx1c7hhg=,kind:videoCut",
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
    "cut:!(126.6500015258789,143.9080047607422),fact:MBVzjTZAKHFuPK9SuhQsgLAr2lRRfy-rViIro-44yuw=,kind:videoCut",
    "cut:!(1160.0799560546875,1171.5899658203125),fact:'9cFc_25JugYqu19HfSQdfgadl0LX4Qg_WcXOH9zBoAo=',kind:videoCut",
    "cut:!(666.4299926757812,679.3599853515625),fact:tF28zRtglq6ZSgnYjC4oDfx8Ld68kK8cs6CfX6xukkI=,kind:videoCut",
    "cut:!(4725.0498046875,4796.17919921875),fact:YWNE_-DOv-dDMrppTEm9eeGmfhAbcrBMDMXUe3aWU7A=,kind:videoCut",
    "cut:!(322.2699890136719,344.3800048828125),fact:O_X9UPU_D3q1UbQ1EdlfzL1QytBu6BAA2lNaYwLwjM0=,kind:videoCut",
    "cut:!(2409.35009765625,2416.639892578125),fact:KIrlje7ZKQM8ujNt-ikGEW_goD_c3Yz1zWwMsKGsipk=,kind:videoCut",
    "cut:!(80.46900177001953,113.04000091552734),fact:HTRxrXaUzuW1NNhfUVCi9Gwl_VZWzSAudlXjqny6udM=,kind:videoCut",
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
