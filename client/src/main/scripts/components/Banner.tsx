/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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

interface BannerProps {
  isSuccess?: boolean;
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
          {this.props.children ? (
            <p className={textClasses}>{this.props.children}</p>
          ) : null}
        </div>
      </div>
    );
  }
}

export default Banner;
