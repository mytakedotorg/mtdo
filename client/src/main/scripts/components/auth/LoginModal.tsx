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
import React, { useEffect, useState } from "react";
import { getFullURLPath, isLoggedIn } from "../../browser";
import { Routes } from "../../java2ts/Routes";
import { post } from "../../network";
import LoginModalView from "./LoginModalView";
import { COOKIE_CHANGE_EVENT, LoginReq, LoginRes } from "./LoginTypes";

interface LoginModalProps {
  initialLoginRes?: Partial<LoginRes>;
  isOpen: boolean;
  onRequestClose(isLoggedin: boolean): void;
}

interface LoginState {
  loginRes?: Partial<LoginRes>;
  isLoggedIn: boolean;
  isFormSubmitted: boolean;
}
const LoginModal: React.FC<LoginModalProps> = (props) => {
  const [loginState, setLoginState] = useState<LoginState>({
    loginRes: props.initialLoginRes,
    isLoggedIn: false,
    isFormSubmitted: false,
  });

  useEffect(() => {
    if (props.initialLoginRes) {
      setLoginState((prevState) => ({
        ...prevState,
        loginRes: props.initialLoginRes,
      }));
    }
  }, [props.initialLoginRes]);

  const login = async (email: string) => {
    const res = await post<LoginReq, LoginRes>(Routes.API_LOGIN, {
      kind: "use",
      email,
      redirect: getFullURLPath(),
    });
    document.dispatchEvent(new Event(COOKIE_CHANGE_EVENT));
    setLoginState({
      loginRes: res,
      isLoggedIn: isLoggedIn(),
      isFormSubmitted: true,
    });
  };

  const handleRequestClose = () => {
    props.onRequestClose(loginState.isLoggedIn);
  };
  return (
    <LoginModalView
      events={{
        onFormSubmit: login,
        onRequestClose: handleRequestClose,
      }}
      loginRes={loginState.loginRes}
      isOpen={props.isOpen}
      showForm={
        !loginState.loginRes ||
        (!!props.initialLoginRes && !loginState.isFormSubmitted)
      }
    />
  );
};

export default LoginModal;
