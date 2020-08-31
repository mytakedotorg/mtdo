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

interface LoginModalProps {
  isOpen: boolean;
  onRequestClose(): void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("A name was submitted: " + inputValue);
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
      <h2 className="modal__header">Welcome back!</h2>
      <button className="modal__close" onClick={onRequestClose}>
        <X />
      </button>
      <p className="modal__text">
        We sent you an email with more details about what we’re building
        together. Keep exploring but read it when you get a chance.
      </p>
      <form className="modal__form" onSubmit={handleSubmit}>
        <label className="modal__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="text"
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
      <button className="modal__button" onClick={onRequestClose}>
        Okay, I'll read it later.
      </button>
    </Modal>
  );
};

export default LoginModal;
