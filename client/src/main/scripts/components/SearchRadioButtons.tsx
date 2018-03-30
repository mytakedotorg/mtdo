import * as React from "react";
import { SelectionOptions } from "./VideoResults";

interface SearchRadioButtonsProps {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => any;
  selectedOption: SelectionOptions;
}

const SearchRadioButtons: React.StatelessComponent<
  SearchRadioButtonsProps
> = props => {
  return (
    <div className="searchradio">
      <div className="searchradio__actions">
        <div className="searchradio__group">
          <input
            type="radio"
            id="radio--containing"
            className="searchradio__radio"
            name="type"
            value="Containing"
            onChange={props.onChange}
            checked={props.selectedOption === "Containing"}
          />
          <label
            htmlFor="radio--containing"
            className="searchradio__radio-label"
          >
            sentences containing word
          </label>
        </div>
        <div className="searchradio__group">
          <input
            type="radio"
            id="radio--beforeandafter"
            className="searchradio__radio"
            name="type"
            value="BeforeAndAfter"
            onChange={props.onChange}
            checked={props.selectedOption === "BeforeAndAfter"}
          />
          <label
            htmlFor="radio--beforeandafter"
            className="searchradio__radio-label"
          >
            sentences before and after word
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchRadioButtons;
