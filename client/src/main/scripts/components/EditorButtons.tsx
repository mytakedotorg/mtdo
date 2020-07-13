/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
import { ButtonEventHandlers, Status } from "./BlockWriter";
import Banner from "./Banner";

interface ButtonProps {
  onClick: () => void;
  classModifier: string;
  text: string;
  isDisabled?: boolean;
}

const Button: React.StatelessComponent<ButtonProps> = (props) => {
  const classModifier = props.isDisabled
    ? "editor__button--disabled"
    : props.classModifier;
  const classes = "editor__button " + classModifier;
  return (
    <button
      className={classes}
      onClick={props.onClick}
      disabled={props.isDisabled !== undefined ? props.isDisabled : false}
    >
      {props.text}
    </button>
  );
};

interface EditorButtonsProps {
  status: Status;
  eventHandlers: ButtonEventHandlers;
}

const EditorButtons: React.StatelessComponent<EditorButtonsProps> = (props) => {
  return (
    <div className="editor__meta">
      <Banner isSuccess={!props.status.error}>{props.status.message}</Banner>
      <Button
        onClick={props.eventHandlers.handleSaveClick}
        classModifier="editor__button--save"
        text="Save"
        isDisabled={props.status.saved}
      />
      <Button
        onClick={props.eventHandlers.handlePublishClick}
        classModifier="editor__button--publish"
        text="Save &amp; Publish"
      />
      <Button
        onClick={props.eventHandlers.handleDeleteClick}
        classModifier="editor__button--delete"
        text="Delete Draft"
      />
    </div>
  );
};

export default EditorButtons;
