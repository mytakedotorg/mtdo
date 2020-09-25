import React from "react";
import { INFO_HEADER_TABS, Tab } from "./infoHeader";

interface TabsProps {
  activeTab: Tab;
  onTabClick(tab: Tab): void;
  className: string;
}

const Tabs: React.FC<TabsProps> = (props) => {
  return (
    <ul className={props.className}>
      {INFO_HEADER_TABS.map((tab) => {
        const tabClass =
          tab.tabTitle === props.activeTab.tabTitle
            ? "header__tab header__tab--active"
            : "header__tab";
        return (
          <li
            key={tab.tabTitle}
            className={tabClass}
            onClick={() => props.onTabClick(tab)}
          >
            {tab.tabTitle}
          </li>
        );
      })}
    </ul>
  );
};

export default Tabs;
