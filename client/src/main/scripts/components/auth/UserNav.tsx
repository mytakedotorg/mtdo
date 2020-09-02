/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import React, { useEffect, useState } from "react";
import { getCookie } from "../../browser";
import { LoginCookie } from "../../java2ts/LoginCookie";
import { COOKIE_CHANGE_EVENT } from "./LoginTypes";
import UserNavView from "./UserNavView";

const UserNav: React.FC = () => {
  const [cookie, setCookie] = useState<LoginCookie | null>(getCookie());

  function handleCookieChange() {
    setCookie(getCookie());
  }

  useEffect(() => {
    document.addEventListener(COOKIE_CHANGE_EVENT, handleCookieChange);
    return () => {
      document.removeEventListener(COOKIE_CHANGE_EVENT, handleCookieChange);
    };
  }, []);
  return <UserNavView cookie={cookie} />;
};

export default UserNav;
