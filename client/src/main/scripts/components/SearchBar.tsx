import * as React from "react";
import * as ReactDOM from "react-dom";
import DropDown from "./DropDown";
import { slugify } from "../utils/functions";
import { Routes } from "../java2ts/Routes";

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
  handleRemoveTagClick = (event: React.MouseEvent<HTMLDivElement>) => {
    window.location.href =
      Routes.FOUNDATION + "?q=" + slugify(this.state.value);
  };
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: event.target.value });
  };
  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href =
      Routes.FOUNDATION + "?q=" + slugify(this.state.value);
  };
  render() {
    const Toggle = (
      <span className="searchbar__toggle-element">
        <span className="searchbar__toggle-text searchbar__toggle-text--filter-icon">
          <i className="fa fa-filter" aria-hidden="true" />
        </span>
        <span className="searchbar__toggle-text searchbar__toggle-text--caret-icon">
          <i className="fa fa-caret-down" aria-hidden="true" />
        </span>
        <span className="searchbar__toggle-text searchbar__toggle-text--user">
          <span className="searchbar__filter-text">search in...</span>
        </span>
      </span>
    );
    return (
      <div className="searchbar">
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
            <a
              className="searchbar__button-link"
              href={
                Routes.FOUNDATION +
                "?q=" +
                slugify(this.state.value) +
                "&" +
                "f=in+debates+said+by+donald+trump"
              }
            >
              <span className="searchbar__button-text">
                in debates said by Donald Trump
              </span>
            </a>
            <div
              className="searchbar__button-close"
              onClick={this.handleRemoveTagClick}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </div>
          </div>
          <div className="searchbar__button searchbar__button--filter">
            <a
              className="searchbar__button-link"
              href={
                Routes.FOUNDATION +
                "?q=" +
                slugify(this.state.value) +
                "&" +
                "f=in+the+constitution"
              }
            >
              <span className="searchbar__button-text">
                in the Constitution
              </span>
            </a>
            <div
              className="searchbar__button-close"
              onClick={this.handleRemoveTagClick}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="searchbar__toggle-container">
          <div className="searchbar__button searchbar__button--filter-toggle">
            <DropDown
              classModifier="searchbar"
              dropdownPosition="BL"
              toggleText={Toggle}
            >
              <div className="searchbar__dropdown">
                <p className="searchbar__dropdown-text">
                  <i
                    className="fa fa-exclamation-triangle"
                    aria-hidden="true"
                  />Under construction
                </p>
                <p className="searchbar__dropdown-link">
                  <a
                    className="searchbar__link"
                    href="https://meta.mytake.org/t/how-to-contribute-to-mytake-org/29"
                  >
                    How to help
                  </a>
                </p>
                <p className="searchbar__dropdown-link">
                  <a className="searchbar__link" href={Routes.FOUNDATION}>
                    Browse the Foundation
                  </a>
                </p>
              </div>
            </DropDown>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchBar;
