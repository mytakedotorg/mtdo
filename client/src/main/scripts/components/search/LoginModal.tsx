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
import { X } from "react-feather";
import Modal from "react-modal";
import { Routes } from "../../java2ts/Routes";
import { post } from "../../network";

interface LoginModalProps {
  isOpen: boolean;
  onRequestClose(): void;
}

interface LoginReq {
  email: string;
  kind: string;
  redirect?: string;
}

interface LoginRes {
  title: string;
  body: string;
  btn: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [loginRes, setLoginRes] = useState<LoginRes | undefined>();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const login = async () => {
    try {
      const res = await post<LoginReq, LoginRes>(Routes.API_LOGIN, {
        kind: "use",
        email: inputValue,
      });
      setLoginRes(res);
    } catch (err) {
      console.error(err);
      console.warn("TODO: handle error state");
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login();
  };
  return (
    <Modal
      isOpen={isOpen}
      portalClassName="modal__portal"
      overlayClassName="modal__overlay"
      className="modal"
      onRequestClose={onRequestClose}
      shouldFocusAfterRender={false}
      shouldCloseOnOverlayClick={true}
    >
      {loginRes ? (
        <>
          <h2 className="modal__header">{loginRes.title}</h2>
          <p className="modal__text">{loginRes.body}</p>
          <button className="modal__button" onClick={onRequestClose}>
            {loginRes.btn}
          </button>
        </>
      ) : (
        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required={true}
            className="modal__input"
            value={inputValue}
            onChange={handleChange}
          />
          <input
            type="submit"
            className="modal__button"
            value="Login or Create Account"
          />
        </form>
      )}
      <button className="modal__close" onClick={onRequestClose}>
        <X />
      </button>
    </Modal>
  );
};

export default LoginModal;
