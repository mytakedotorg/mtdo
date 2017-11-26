import * as React from "react";
import * as ReactDOM from "react-dom";

interface BannerProps {
  isSuccess: boolean;
}

class Banner extends React.Component<BannerProps, {}> {
  constructor(props: BannerProps) {
    super(props);
  }
  render() {
    let textClasses: string = "banner__text";

    if (this.props.isSuccess) {
      textClasses += " banner__text--green";
    } else {
      textClasses += " banner__text--red";
    }

    return (
      <div className="banner">
        <div className="banner__inner-container">
          <p className={textClasses}>
            {this.props.children}
          </p>
        </div>
      </div>
    );
  }
}

export default Banner;
