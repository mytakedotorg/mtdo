import * as React from "react";
import { SelectionOptions } from "../TimelineView";

interface TimelineRadioButtonsProps {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => any;
  selectedOption: SelectionOptions;
}

const TimelineRadioButtons: React.StatelessComponent<
  TimelineRadioButtonsProps
> = props => {
  return (
    <div className="timeline__inner-container">
      <div className="timeline__actions">
        <input
          type="radio"
          id="radio--debates"
          className="timeline__radio"
          name="type"
          value="Debates"
          onChange={props.onChange}
          checked={props.selectedOption === "Debates"}
        />
        <label htmlFor="radio--debates" className="timeline__radio-label">
          Debates
        </label>
        <input
          type="radio"
          id="radio--documents"
          className="timeline__radio"
          name="type"
          value="Documents"
          onChange={props.onChange}
          checked={props.selectedOption === "Documents"}
        />
        <label htmlFor="radio--documents" className="timeline__radio-label">
          Founding Documents
        </label>
      </div>
    </div>
  );
};

export default TimelineRadioButtons;
