import * as React from "react";
import * as ReactDOM from "react-dom";

interface BannerProps {}

class Banner extends React.Component<BannerProps, {}> {
  constructor(props: BannerProps) {
    super(props);
  }
  render() {
    return (
      <div className="banner">
        <p className="banner__text">
          Unfortunately takes can't be saved yet. If you really like what you
          wrote, feel free to screenshot it and share it with us.
        </p>
      </div>
    );
  }
}

export default Banner;
