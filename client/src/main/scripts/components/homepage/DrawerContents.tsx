/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
import React from "react";
import GetInvolved from "./GetInvolved";
import HowToUseThis from "./HowToUseThis";
import { INFO_HEADER_TABS_ENUM, useSocials } from "./infoHeader";
import WhatIsThis from "./WhatIsThis";

interface DrawerContentsProps {
  activeTab: INFO_HEADER_TABS_ENUM;
}

const DrawerContents: React.FC<DrawerContentsProps> = (props) => {
  const { leftSocial, rightSocial } = useSocials();
  switch (props.activeTab) {
    case INFO_HEADER_TABS_ENUM.GET_INVOLVED:
      return <GetInvolved />;
    case INFO_HEADER_TABS_ENUM.HOW_TO_USE_THIS:
      return <HowToUseThis />;
    case INFO_HEADER_TABS_ENUM.WHAT_IS_THIS:
      return <WhatIsThis leftSocial={leftSocial} rightSocial={rightSocial} />;
  }
};

export default DrawerContents;
