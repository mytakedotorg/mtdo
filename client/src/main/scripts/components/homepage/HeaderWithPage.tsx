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
import React, { useState } from "react";
import { isHomePage, isSearchPage, MtdoArgs } from "../../page";
import UserNav from "../auth/UserNav";
import SearchBar from "../SearchBar";
import Drawer from "./Drawer";
import { INFO_HEADER_TABS, Tab } from "./infoHeader";
import Tabs from "./Tabs";

interface HeaderProps {
  args?: MtdoArgs;
}

const HeaderWithPage: React.FC<HeaderProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(INFO_HEADER_TABS[0]);

  const onLogoClick = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const onTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  const tabsClass = isExpanded
    ? "header__tabs header__tabs--visible"
    : "header__tabs";

  const headerClass = isSearchPage(props.args)
    ? "header header--search"
    : "header";
  return (
    <>
      <header className={headerClass} role="banner">
        <a className="header__skip-link" href="#app" tabIndex={1}>
          Skip to main content
        </a>
        <div className="header__top">
          <span
            className="header__logo-link"
            onClick={
              !isHomePage(props.args) && !isSearchPage(props.args)
                ? onLogoClick
                : undefined
            }
          >
            <div className="header__logo-image-container">
              <img
                className="header__logo-image"
                src="/assets/permanent/square-wheat-482248dddd.png"
                width="100"
                height="100"
                alt="MyTake.org | Fundamentals, in context."
              />
            </div>
            <em className="header__logo-title">
              <span className="header__logo--mytake">MyTake</span>
              <span className="header__logo--org">.org</span>
            </em>
            <span className="header__moreinfo-link">More info</span>
          </span>
          {!isHomePage(props.args) && !isSearchPage(props.args) && (
            <Tabs
              activeTab={activeTab}
              className={tabsClass}
              onTabClick={onTabClick}
            />
          )}
          {isSearchPage(props.args) && (
            <div className="header__searchbar">
              <SearchBar
                initialSearchQuery={props.args.searchTerm}
                classModifier="search"
              />
            </div>
          )}
          <UserNav />
        </div>
      </header>
      <Drawer activeTab={activeTab} isExpanded={isExpanded} />
      {props.children}
    </>
  );
};

export default HeaderWithPage;
