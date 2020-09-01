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
import { Routes } from "../../java2ts/Routes";
import { post } from "../../network";
import LoginModalView from "./LoginModalView";
import { COOKIE_CHANGE_EVENT, LoginReq, LoginRes } from "./LoginTypes";

interface LoginModalProps {
  isOpen: boolean;
  onRequestClose(): void;
}

const LoginModal: React.FC<LoginModalProps> = (props) => {
  const [loginRes, setLoginRes] = useState<LoginRes | undefined>();

  const login = async (email: string) => {
    const res = await post<LoginReq, LoginRes>(Routes.API_LOGIN, {
      kind: "use",
      email,
      redirect: `${window.location.href.substring(
        window.location.href.indexOf("/", 8)
      )}`,
    });
    console.log("dispatching event");
    document.dispatchEvent(new Event(COOKIE_CHANGE_EVENT));
    setLoginRes(res);
  };

  return (
    <LoginModalView
      events={{
        onFormSubmit: login,
        onRequestClose: props.onRequestClose,
      }}
      loginRes={loginRes}
      isOpen={props.isOpen}
    />
  );
};

export default LoginModal;
