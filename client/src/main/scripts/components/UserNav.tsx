import * as React from "react";
import * as ReactDOM from "react-dom";

interface UserNavProps {}
interface UserNavState {}
class UserNav extends React.Component<UserNavProps, UserNavState> {
  constructor(props: UserNavProps) {
    super(props);
  }
  render() {
    return (
      <div className="usernav">
        <a href="javascript:void(0)" className="usernav__toggle-link">
          <span className="usernav__icon">
            <i className="fa fa-bars" aria-hidden="true" />
          </span>
        </a>
      </div>
    );
  }
}

export default UserNav;
