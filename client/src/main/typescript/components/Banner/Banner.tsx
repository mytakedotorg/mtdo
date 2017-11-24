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
        <div className="banner__inner-container">
          <p className="banner__text banner__text--reg">
            Unfortunately Takes can't be saved yet. If you really like what you
            wrote, feel free to screenshot it and share it with us at {" "}
            <a
              className="banner__text banner__text--link"
              href="mailto:edgar.twigg@gmail.com?Subject=Take%20Screenshot"
            >
              edgar.twigg@gmail.com
            </a>. For more information please refer to{" "}
            <a
              className="banner__text banner__text--link"
              href="https://github.com/mytake/mytake/blob/master/WORK_IN_PROGRESS.md"
            >
              how to use the MyTake.org prototype
            </a>.
          </p>
        </div>
      </div>
    );
  }
}

export default Banner;
