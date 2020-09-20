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
import { isSearchPage, MtdoArgs } from "../page";
import UserNav from "./auth/UserNav";
import SearchBar from "./SearchBar";

interface HeaderProps {
  args?: MtdoArgs;
}

const HeaderWithPage: React.FC<HeaderProps> = (props) => {
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
          <a className="header__logo-link" href="/">
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
          </a>
          {isSearchPage(props.args) && (
            <SearchBar
              initialSearchQuery={props.args.searchTerm}
              classModifier="search"
            />
          )}
          <UserNav />
        </div>
      </header>
      {props.children}
    </>
  );
};

export default HeaderWithPage;
