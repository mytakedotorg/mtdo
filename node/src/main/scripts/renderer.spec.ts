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

expect.extend({ toMatchImageSnapshot });

test("show the 13th amendment", async (done) => {
  const buffer = await RenderQueue.render(
    "cut:!(2007.9000244140625,2046.1099853515625),fact:oZVEQzZXVzx3lM_PbszcA35XYBJxEDHwJirpx1c7hhg=,kind:videoCut"
  );
  await RenderQueue.close();
  expect(buffer).toMatchImageSnapshot({
    failureThreshold: 5,
    failureThresholdType: "percent",
  });
  done();
});
