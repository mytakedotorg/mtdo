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
const request = require("supertest");

export async function expect404(url: string) {
  const originalWarn = console.warn;
  try {
    const consoleOutput: string[] = [];
    console.warn = (arg: any) => consoleOutput.push(arg.toString());
    const response = await request(underTest).get(url);
    expect(response.statusCode).toBe(404);
    expect(consoleOutput.join("\n")).toMatchSnapshot();
  } catch (error) {
    throw error;
  } finally {
    console.warn = originalWarn;
  }
}

export const imgDiffCfg: any = {
  customDiffConfig: {
    threshold: 0.3,
  },
  failureThreshold: 0.1,
  // 10% error is a lot!  But text has slightly
  // different widths on mac vs linux, so very
  // different
  failureThresholdType: "percent",
};
