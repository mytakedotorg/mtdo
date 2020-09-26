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
import React from "react";
import { INFO_HEADER_TABS_ENUM, INFO_HEADER_TAB_NAMES } from "./infoHeader";

interface TabsProps {
  activeTab: INFO_HEADER_TABS_ENUM;
  isVisible: boolean;
  onTabClick(
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    tab: INFO_HEADER_TABS_ENUM
  ): void;
}

const Tabs: React.FC<TabsProps> = (props) => {
  const className = props.isVisible ? "tabs tabs--visible" : "tabs";
  return (
    <div className={className}>
      <ul className="tab__ul">
        {INFO_HEADER_TAB_NAMES.map((tab) => {
          const tabClass = tab === props.activeTab ? "tab tab--active" : "tab";
          return (
            <li
              key={tab}
              className={tabClass}
              onClick={(e) => props.onTabClick(e, tab)}
            >
              {tab}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Tabs;
