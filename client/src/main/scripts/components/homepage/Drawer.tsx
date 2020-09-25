import React from "react";
import { Tab } from "./infoHeader";

interface DrawerProps {
  activeTab: Tab;
  isExpanded: boolean;
}
const Drawer: React.FC<DrawerProps> = (props) => {
  const drawerClass = props.isExpanded
    ? "header__drawer header__drawer--visible"
    : "header__drawer";
  const overlayClass = props.isExpanded
    ? "header__overlay header__overlay--visible"
    : "header__overlay";
  return <div className={drawerClass}>{props.activeTab.component}</div>;
};

export default Drawer;
