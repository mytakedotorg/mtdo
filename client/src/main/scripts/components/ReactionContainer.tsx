/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { Routes } from "../java2ts/Routes";
import { TakeReactionJson } from "../java2ts/TakeReactionJson";
import { FollowJson } from "../java2ts/FollowJson";
import { alertErr, getUsernameFromURL, isLoggedIn } from "../utils/functions";
import { TakeDocument } from "./BlockEditor";
import DropDown from "./DropDown";
import EmailTake from "./EmailTake";
import { post } from "../utils/foundationData/FoundationDataBuilder";

interface ReactionContainerProps {
  takeId: number;
  takeDocument: TakeDocument;
}

interface ReactionContainerState {
  isFollowing?: boolean;
  takeState?: TakeReactionJson.TakeState;
  userState?: TakeReactionJson.UserState;
}

type abuseType = "spam" | "harassment" | "rulesviolation";

class ReactionContainer extends React.Component<
  ReactionContainerProps,
  ReactionContainerState
> {
  private username: string;
  constructor(props: ReactionContainerProps) {
    super(props);

    this.state = {};
  }
  fetchReactions = async () => {
    await wait(2000);
    const takeReaction = await post<
      TakeReactionJson.ViewReq,
      TakeReactionJson.ViewRes
    >(Routes.API_TAKE_VIEW, { take_id: this.props.takeId });
    this.setState({
      takeState: takeReaction.takeState,
      userState: takeReaction.userState,
    });

    if (isLoggedIn()) {
      this.username = getUsernameFromURL();
      const followRes = await post<
        FollowJson.FollowAskReq,
        FollowJson.FollowRes
      >(Routes.API_FOLLOW_ASK, { username: this.username });
      this.setState({
        isFollowing: followRes.isFollowing,
      });
    }
  };
  followButtonPress = async () => {
    if (isLoggedIn()) {
      if (!this.username) {
        this.username = getUsernameFromURL();
      }
      const followRes = await post<
        FollowJson.FollowTellReq,
        FollowJson.FollowRes
      >(Routes.API_FOLLOW_TELL, {
        isFollowing:
          typeof this.state.isFollowing == "boolean"
            ? !this.state.isFollowing
            : true,
        username: this.username,
      });
      this.setState({
        isFollowing: followRes.isFollowing,
      });
    } else {
      //User not logged in, redirect to /login
      window.location.href =
        Routes.LOGIN +
        "?redirect=" +
        window.location.pathname +
        "&loginreason=Login+or+create+an+account+to+follow+another+user.";
    }
  };
  starButtonPress = async () => {
    if (this.state.userState) {
      const userState = {
        ...this.state.userState,
        like: !this.state.userState.like,
      };
      this.postReact(userState);
    } else {
      window.location.href = `${Routes.LOGIN}?redirect=${window.location.pathname}&loginreason=You+must+have+an+account+to+star+a+Take.`;
    }
  };
  reportButtonPress = (type: abuseType) => {
    if (this.state.userState) {
      let userState;
      switch (type) {
        case "spam":
          userState = {
            ...this.state.userState,
            spam: !this.state.userState.spam,
          };
          break;
        case "harassment":
          userState = {
            ...this.state.userState,
            harassment: !this.state.userState.harassment,
          };
          break;
        case "rulesviolation":
          userState = {
            ...this.state.userState,
            rulesviolation: !this.state.userState.rulesviolation,
          };
          break;
        default:
          alertErr("ReactionContainer: Unknown report button type");
          throw "Unknown report button type";
      }

      this.postReact(userState);
    } else {
      window.location.href = `${Routes.LOGIN}?redirect=${window.location.pathname}&loginreason=You+must+have+an+account+to+report+a+Take.`;
    }
  };
  postReact = async (userState: TakeReactionJson.UserState) => {
    const reactRes = await post<
      TakeReactionJson.ReactReq,
      TakeReactionJson.ReactRes
    >(Routes.API_TAKE_REACT, {
      take_id: this.props.takeId,
      userState: userState,
    });
    this.setState({
      takeState: reactRes.takeState,
      userState: reactRes.userState,
    });
  };
  componentDidMount() {
    this.fetchReactions();
  }
  render() {
    const eventListeners = {
      onStarPress: this.starButtonPress,
      onReportPress: this.reportButtonPress,
      onFollowPress: this.followButtonPress,
    };
    return (
      <Reaction
        containerProps={this.props}
        containerState={this.state}
        eventListeners={eventListeners}
      />
    );
  }
}

interface ReactionProps {
  containerProps: ReactionContainerProps;
  containerState: ReactionContainerState;
  eventListeners: {
    onStarPress: () => any;
    onReportPress: (type: abuseType) => any;
    onFollowPress: () => any;
  };
}

interface ReactionState {
  subMenuIsOpen: boolean;
}

export class Reaction extends React.Component<ReactionProps, ReactionState> {
  constructor(props: ReactionProps) {
    super(props);

    this.state = {
      subMenuIsOpen: false,
    };
  }
  toggleMenu = () => {
    const menuIsOpen = this.state.subMenuIsOpen;
    if (!menuIsOpen) {
      window.addEventListener("mousedown", this.onMouseDown);
    } else {
      window.removeEventListener("mousedown", this.onMouseDown);
    }
    this.setState({
      subMenuIsOpen: !menuIsOpen,
    });
  };
  onMouseDown = (e: MouseEvent) => {
    if (e.target) {
      if (!(e.target as HTMLElement).classList.contains("reaction__action")) {
        this.setState({
          subMenuIsOpen: false,
        });
        window.removeEventListener("mousedown", this.onMouseDown);
      }
    }
  };
  componentWillUnmount() {
    window.removeEventListener("mousedown", this.onMouseDown);
  }
  render() {
    const { props } = this;
    const { userState } = props.containerState;

    let menuClassModifier;
    if (!this.state.subMenuIsOpen) {
      menuClassModifier = "reaction__submenu--collapse";
    } else if (userState) {
      if (userState.harassment || userState.spam || userState.rulesviolation) {
        menuClassModifier = "reaction__submenu--wide";
      } else {
        menuClassModifier = "";
      }
    } else {
      menuClassModifier = "";
    }

    return (
      <div className="reaction">
        <div className="reaction__counts">
          <p className="reaction__count reaction__count--views">
            Views:{" "}
            {props.containerState.takeState
              ? props.containerState.takeState.viewCount
              : "-"}
          </p>
          <p className="reaction__count reaction__count--stars">
            Stars:{" "}
            {props.containerState.takeState
              ? props.containerState.takeState.likeCount
              : "-"}
          </p>
        </div>

        <div className="reaction__actions">
          <div className="reaction__action-container">
            <button
              className="reaction__action reaction__action--star"
              onClick={props.eventListeners.onStarPress}
              disabled={typeof props.containerState.takeState == "undefined"}
            >
              {props.containerState.userState &&
              props.containerState.userState.like ? (
                <i className="fa fa-star" aria-hidden="true" />
              ) : (
                <i className="fa fa-star-o" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="reaction__action-container">
            <button
              className="reaction__action reaction__action--follow"
              onClick={props.eventListeners.onFollowPress}
            >
              {props.containerState.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
          <div className="reaction__action-container">
            <DropDown
              classModifier="reaction"
              dropdownPosition="TL"
              toggleText="Email"
            >
              <EmailTake
                takeDocument={(Object as any).assign(
                  {},
                  props.containerProps.takeDocument
                )}
              />
            </DropDown>
          </div>
          <div className="reaction__action-container">
            <button
              className="reaction__action reaction__action--report"
              onClick={this.toggleMenu}
            >
              Report
            </button>
            <ul className={"reaction__submenu " + menuClassModifier}>
              <li className="reaction__li">
                <button
                  className="reaction__action reaction__action--spam"
                  onClick={() => props.eventListeners.onReportPress("spam")}
                  disabled={
                    typeof props.containerState.takeState == "undefined"
                  }
                >
                  {props.containerState.userState &&
                  props.containerState.userState.spam
                    ? "Marked as spam. Unmark?"
                    : "spam"}
                </button>
              </li>
              <li className="reaction__li">
                <button
                  className="reaction__action reaction__action--harassment"
                  onClick={() =>
                    props.eventListeners.onReportPress("harassment")
                  }
                  disabled={
                    typeof props.containerState.takeState == "undefined"
                  }
                >
                  {props.containerState.userState &&
                  props.containerState.userState.harassment
                    ? "Marked as harassment. Unmark?"
                    : "harassment"}
                </button>
              </li>
              <li className="reaction__li">
                <button
                  className="reaction__action reaction__action--rules"
                  onClick={() =>
                    props.eventListeners.onReportPress("rulesviolation")
                  }
                  disabled={
                    typeof props.containerState.takeState == "undefined"
                  }
                >
                  {props.containerState.userState &&
                  props.containerState.userState.rulesviolation
                    ? "Marked as rules violation. Unmark?"
                    : "rules violation"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const wait = (ms: number): Promise<void> => {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
};

export default ReactionContainer;
