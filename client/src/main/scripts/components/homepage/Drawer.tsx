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
import React, { useEffect, useRef } from "react";
import DrawerContents from "./DrawerContents";
import { INFO_HEADER_TABS_ENUM } from "./infoHeader";

interface DrawerProps {
  activeTab: INFO_HEADER_TABS_ENUM;
  onClose(): void;
  isExpanded: boolean;
}
const Drawer: React.FC<DrawerProps> = (props) => {
  const scrollerDiv = useRef<HTMLDivElement | null>(null);
  const drawerClass = props.isExpanded ? "drawer drawer--visible" : "drawer";
  const drawerHeight = props.isExpanded ? window.innerHeight * 0.85 : 0;
  const overlayClass = props.isExpanded
    ? "drawer__overlay drawer__overlay--visible"
    : "drawer__overlay";
  useEffect(() => {
    scrollerDiv.current && (scrollerDiv.current.scrollTop = 0);
  }, [scrollerDiv, props.activeTab]);
  return (
    <>
      <div className={drawerClass} style={{ maxHeight: drawerHeight }}>
        <div className="drawer__scroller" ref={scrollerDiv}>
          <div className="drawer__contents">
            <DrawerContents activeTab={props.activeTab} />
          </div>
        </div>
      </div>
      <div className={overlayClass} onClick={props.onClose} />
    </>
  );
};

export default Drawer;
