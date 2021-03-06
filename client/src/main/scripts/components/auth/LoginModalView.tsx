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
import { LoginRes } from "./LoginTypes";

export interface LoginModalViewEvents {
  onFormSubmit(email: string): void;
  onRequestClose(): void;
}
interface LoginModalViewProps {
  isOpen: boolean;
  events: LoginModalViewEvents;
  loginRes?: Partial<LoginRes>;
  showForm: boolean;
}

const LoginModalView: React.FC<LoginModalViewProps> = (props) => {
  const [inputValue, setInputValue] = useState<string>("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.events.onFormSubmit(inputValue);
  };
  return (
    <Modal
      isOpen={props.isOpen}
      portalClassName="modal__portal"
      overlayClassName="modal__overlay"
      className="modal"
      onRequestClose={props.events.onRequestClose}
      shouldFocusAfterRender={false}
      shouldCloseOnOverlayClick={true}
    >
      {props.loginRes && (
        <>
          {props.loginRes.title && (
            <h2 className="modal__header">{props.loginRes.title}</h2>
          )}
          {props.loginRes.body && (
            <p className="modal__text">{props.loginRes.body}</p>
          )}
          {props.loginRes.btn && (
            <button
              className="modal__button"
              onClick={props.events.onRequestClose}
            >
              {props.loginRes.btn}
            </button>
          )}
        </>
      )}
      {props.showForm && (
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
      <button className="modal__close" onClick={props.events.onRequestClose}>
        <X />
      </button>
    </Modal>
  );
};

export default LoginModalView;
