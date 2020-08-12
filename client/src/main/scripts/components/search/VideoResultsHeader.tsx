/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import React, { useEffect, useRef } from "react";

interface VideoResultsHeaderProps {
  isFixed: boolean;
  onScroll: (isAtTopOfScreen: boolean) => any;
}

const VideoResultsHeader: React.FC<VideoResultsHeaderProps> = ({
  children,
  isFixed,
  onScroll,
}) => {
  const divEl = useRef<HTMLDivElement | null>(null);
  function handleScroll() {
    if (divEl.current) {
      onScroll(divEl.current.getBoundingClientRect().top <= 0);
    }
  }
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    const cleanup = () => {
      window.removeEventListener("scroll", handleScroll);
    };
    return cleanup;
  }, []);

  return (
    <div ref={divEl}>
      <div className={isFixed ? "results-header__fixed" : ""}>{children}</div>
    </div>
  );
};

export default VideoResultsHeader;
