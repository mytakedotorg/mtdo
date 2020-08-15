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
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SocialImage } from "./common/social/SocialImage";

(window as any).render = (args: string) => {
  // on the node.mytake.org server,
  // this function is called over and over by puppeteer
  // on a single page
  const app = document.getElementById("socialembed")!;
  ReactDOM.render(<SocialImage embed={args} />, app);
};

if (window.location.hash) {
  // this is used only for dev mode, to allow easy hotreload debugging of images
  // const embed: Embed = JSON.parse(btoa(window.location.hash));
  (window as any).render(window.location.hash);
}
