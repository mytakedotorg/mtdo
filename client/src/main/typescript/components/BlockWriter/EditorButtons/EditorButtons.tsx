import * as React from "react";
import { ButtonEventHandlers, Status } from "../BlockWriter";
import Banner from "../../Banner";

interface ButtonProps {
  onClick: () => void;
  classModifier: string;
  text: string;
  isDisabled?: boolean;
}

const Button: React.StatelessComponent<ButtonProps> = props => {
  const classModifier = props.isDisabled
    ? "editor__button--disabled"
    : props.classModifier;
  const classes = "editor__button " + classModifier;
  return (
    <button className={classes} onClick={props.onClick}>
      {props.text}
    </button>
  );
};

interface EditorButtonsProps {
  status: Status;
  eventHandlers: ButtonEventHandlers;
}

const EditorButtons: React.StatelessComponent<EditorButtonsProps> = props => {
  switch (props.status) {
    case "INITIAL":
      return (
        <div className="editor__meta">
          <Banner />
          <Button
            onClick={props.eventHandlers.handleSaveClick}
            classModifier="editor__button--save"
            text="Save"
            isDisabled={true}
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
    case "SAVED":
      return (
        <div className="editor__meta">
          <Banner isSuccess={true}>Save successful!</Banner>
          <Button
            onClick={props.eventHandlers.handleSaveClick}
            classModifier="editor__button--save"
            text="Save"
            isDisabled={true}
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
    case "UNSAVED":
      return (
        <div className="editor__meta">
          <Banner />
          <Button
            onClick={props.eventHandlers.handleSaveClick}
            classModifier="editor__button--save"
            text="Save"
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
    case "ERROR":
      return (
        <div className="editor__meta">
          <Banner isSuccess={false}>
            There was an error saving your take.
          </Banner>
          <Button
            onClick={props.eventHandlers.handleSaveClick}
            classModifier="editor__button--save"
            text="Save"
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
    default:
      return null;
  }
};

export default EditorButtons;
