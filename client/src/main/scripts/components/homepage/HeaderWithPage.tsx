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
import { INFO_HEADER_TABS_ENUM, INFO_HEADER_TAB_NAMES } from "./infoHeader";
import Tabs from "./Tabs";

interface HeaderProps {
  args?: MtdoArgs;
}

const HeaderWithPage: React.FC<HeaderProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<INFO_HEADER_TABS_ENUM>(
    INFO_HEADER_TAB_NAMES[0]
  );

  const handleLogoClick = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleTabClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    tab: INFO_HEADER_TABS_ENUM
  ) => {
    console.log("tab clicked");
    // prevent bubbling up to our other event handler
    event.stopPropagation();
    setActiveTab(tab);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const headerClass = getHeaderClass(isSearchPage(props.args), isExpanded);

  const shouldShowTabs = !isHomePage(props.args) && !isSearchPage(props.args);
  return (
    <>
      <header className={headerClass} role="banner">
        <a className="header__skip-link" href="#app" tabIndex={1}>
          Skip to main content
        </a>
        <div className="header__top">
          <LinkOrSpan
            className="header__logo-link"
            onClick={shouldShowTabs ? handleLogoClick : undefined}
            isLink={!shouldShowTabs}
            href={!shouldShowTabs ? "/" : undefined}
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
            {shouldShowTabs && (
              <span className="header__moreinfo-link">More info</span>
            )}
          </LinkOrSpan>
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
        {shouldShowTabs && (
          <Tabs
            activeTab={activeTab}
            isVisible={isExpanded}
            onClose={handleClose}
            onTabClick={handleTabClick}
          />
        )}
      </header>
      {shouldShowTabs && (
        <Drawer
          activeTab={activeTab}
          isExpanded={isExpanded}
          onClose={handleClose}
        />
      )}
      {props.children}
    </>
  );
};

export default HeaderWithPage;

const getHeaderClass = (isSearchPage: boolean, isExpanded: boolean): string => {
  if (isSearchPage) {
    return "header header--search";
  }
  if (isExpanded) {
    return "header header--expanded";
  }
  return "header";
};

interface LinkOrSpanProps<T>
  extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<T>, T> {
  isLink: boolean;
}

const LinkOrSpan: React.FC<LinkOrSpanProps<
  HTMLAnchorElement | HTMLSpanElement
>> = (props) => {
  return props.isLink ? (
    <a {...(props as LinkOrSpanProps<HTMLAnchorElement>)}>{props.children}</a>
  ) : (
    <span {...(props as LinkOrSpanProps<HTMLSpanElement>)}>
      {props.children}
    </span>
  );
};
