/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import DropDown from "./DropDown";
import { getUserCookieString } from "../utils/functions";
import { LoginCookie } from "../java2ts/LoginCookie";
import { Routes } from "../java2ts/Routes";

interface UserNavProps {}
interface UserNavState {
  cookie: LoginCookie | null;
}
class UserNav extends React.Component<UserNavProps, UserNavState> {
  constructor(props: UserNavProps) {
    super(props);

    const cookieString = getUserCookieString();
    let cookie: LoginCookie | null;
    if (cookieString) {
      cookie = JSON.parse(JSON.parse(cookieString));
    } else {
      cookie = null;
    }

    this.state = {
      cookie: cookie,
    };
  }
  renderNavLink = (text: string, href: string) => {
    return (
      <li className="usernav__list-item">
        <a className="usernav__link" href={href}>
          {text}
        </a>
      </li>
    );
  };
  render() {
    let Toggle;
    if (this.state.cookie) {
      Toggle = (
        <span className="usernav__toggle-element">
          <span className="usernav__toggle-text usernav__toggle-text--icon">
            <i className="fa fa-bars" aria-hidden="true" />
          </span>
          <span className="usernav__toggle-text usernav__toggle-text--user">
            <span className="usernav__caret">
              <i className="fa fa-caret-down" aria-hidden="true" />
            </span>
            {this.state.cookie.username}
          </span>
        </span>
      );
    } else {
      Toggle = (
        <a className="usernav__toggle-element" href={Routes.LOGIN}>
          <span className="usernav__toggle-text usernav__toggle-text--login">
            Login
          </span>
        </a>
      );
    }
    return (
      <div className="usernav">
        <span className="usernav__icon">
          <DropDown
            classModifier="usernav"
            disabled={this.state.cookie ? false : true}
            dropdownPosition="BL"
            toggleText={Toggle}
          >
            {this.state.cookie ? (
              <ul className="usernav__dropdown">
                {this.renderNavLink("New Draft", Routes.DRAFTS_NEW)}
                {this.renderNavLink("Drafts", Routes.DRAFTS)}
                {this.renderNavLink(
                  "Published",
                  "/" + this.state.cookie.username
                )}
                {this.renderNavLink(
                  "Stars",
                  "/" +
                    this.state.cookie.username +
                    "?" +
                    Routes.PROFILE_TAB +
                    "=" +
                    Routes.PROFILE_TAB_STARS
                )}
                {this.renderNavLink(
                  "Profile",
                  "/" +
                    this.state.cookie.username +
                    "?" +
                    Routes.PROFILE_TAB +
                    "=" +
                    Routes.PROFILE_TAB_EDIT
                )}
                {this.renderNavLink("Logout", Routes.LOGOUT)}
              </ul>
            ) : null}
          </DropDown>
        </span>
      </div>
    );
  }
}

export default UserNav;
