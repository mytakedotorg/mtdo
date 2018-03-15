import * as React from "react";
import * as ReactDOM from "react-dom";

interface SearchBarProps {}
interface SearchBarState {
  value: string;
}
class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
  constructor(props: SearchBarProps) {
    super(props);

    this.state = {
      value: ""
    };
  }
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: event.target.value });
  };
  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    throw "TODO";
  };
  render() {
    return (
      <div className="searchbar-inner">
        <div className="searchbar__input-container">
          <form className="searchbox__form" onSubmit={this.handleSubmit}>
            <input
              className="searchbar__input"
              type="text"
              value={this.state.value}
              placeholder="Search the Foundation"
              onChange={this.handleChange}
            />
          </form>
        </div>
        <div className="searchbar__filter-button-list">
          <div className="searchbar__button searchbar__button--filter">
            <span>Button 1</span>
          </div>
          <div className="searchbar__button searchbar__button--filter">
            <span>Button 2</span>
          </div>
        </div>
        <div className="searchbar__toggle-container">
          <div className="searchbar__button searchbar__button--filter-toggle">
            <i className="fa fa-filter" aria-hidden="true" />
            <i className="fa fa-caret-down" aria-hidden="true" />
            <span className="searchbar__filter-text">search in...</span>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchBar;
