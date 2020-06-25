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
import TimelineView from "./TimelineView";
import { Routes } from "../java2ts/Routes";

interface FoundationViewProps {
  path: string;
  search: string;
}

class FoundationView extends React.Component<FoundationViewProps, {}> {
  constructor(props: FoundationViewProps) {
    super(props);
  }
  render() {
    return (
      <div className="foundation">
        {!this.props.path.startsWith(Routes.FOUNDATION) ? (
          <TimelineView path={this.props.path} />
        ) : (
          <div>
            <div className="foundation__inner-container">
              <h1 className="foundation__heading">Foundation of Facts</h1>
              {this.props.search ? (
                <p className="timeline__instructions timeline__instructions--red">
                  We haven't implemented this yet! Help us finish it on{" "}
                  <a href="https://github.com/mytakedotorg/mytakedotorg/projects/3">
                    GitHub
                  </a>.
                </p>
              ) : null}
              <p className="timeline__instructions">
                Explore Facts in the timeline below.
              </p>
            </div>
            <TimelineView path={this.props.path} />
          </div>
        )}
      </div>
    );
  }
}

export default FoundationView;
