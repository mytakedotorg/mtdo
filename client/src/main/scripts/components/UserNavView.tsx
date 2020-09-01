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
import { ChevronDown } from "react-feather";
import { LoginCookie } from "../java2ts/LoginCookie";
import { Routes } from "../java2ts/Routes";
import DropDown from "./DropDown";

interface UserNavViewProps {
  cookie: LoginCookie | null;
}

const UserNavView: React.FC<UserNavViewProps> = ({ cookie }) => {
  let navLinks: { name: string; href: string }[] = [];
  if (cookie) {
    const path = cookie.username ? cookie.username : Routes.PROFILE_NO_USERNAME;
    navLinks = [
      {
        name: "Bookmarks",
        href: `/${path}?${Routes.PROFILE_TAB}=${Routes.PROFILE_TAB_BOOKMARKS}`,
      },
      { name: "Logout", href: Routes.LOGOUT },
    ];
  }

  return (
    <DropDown
      classModifier="usernav"
      disabled={!cookie}
      dropdownPosition="BL"
      toggleText={
        cookie ? (
          <>
            <ChevronDown />
            {cookie.username}
          </>
        ) : (
          <a href={Routes.LOGIN}>Login</a>
        )
      }
    >
      <ul className="usernav__list">
        {navLinks.map(({ name, href }) => {
          return (
            <li className="usernav__list-item" key={name}>
              <a className="usernav__link" href={href}>
                {name}
              </a>
            </li>
          );
        })}
      </ul>
    </DropDown>
  );
};

export default UserNavView;
