import * as React from "react";
import * as ReactDOM from "react-dom";
import { Routes } from "../java2ts/Routes";
import { TakeReactionJson } from "../java2ts/TakeReactionJson";
import { postRequest } from "../utils/databaseAPI";
import { alertErr } from "../utils/functions";
import { TakeDocument } from "./BlockEditor";
import ShareContainer from "./ShareContainer";

interface ReactionContainerProps {
  takeId: number;
  takeDocument: TakeDocument;
}

interface ReactionContainerState {
  takeState?: TakeReactionJson.TakeState;
  userState?: TakeReactionJson.UserState;
}

type abuseType = "spam" | "harassment" | "rulesviolation";

class ReactionContainer extends React.Component<
  ReactionContainerProps,
  ReactionContainerState
> {
  constructor(props: ReactionContainerProps) {
    super(props);

    this.state = {};
  }
  fetchReactions = () => {
    setTimeout(() => {
      const bodyJson: TakeReactionJson.ViewReq = {
        take_id: this.props.takeId
      };
      postRequest(
        Routes.API_TAKE_VIEW,
        bodyJson,
        (json: TakeReactionJson.ViewRes) => {
          this.setState({
            takeState: json.takeState,
            userState: json.userState
          });
        }
      );
    }, 2000);
  };
  starButtonPress = () => {
    if (this.state.userState) {
      const userState = {
        ...this.state.userState,
        like: !this.state.userState.like
      };

      const bodyJson: TakeReactionJson.ReactReq = {
        take_id: this.props.takeId,
        userState: userState
      };

      postRequest(
        Routes.API_TAKE_REACT,
        bodyJson,
        (json: TakeReactionJson.ReactRes) => {
          this.setState({
            takeState: json.takeState,
            userState: json.userState
          });
        }
      );
    } else {
      window.location.href =
        Routes.LOGIN +
        "?redirect=" +
        window.location.pathname +
        "&loginreason=You+must+have+an+account+to+star+a+Take.";
    }
  };
  reportButtonPress = (type: abuseType) => {
    if (this.state.userState) {
      let userState;
      switch (type) {
        case "spam":
          userState = {
            ...this.state.userState,
            spam: !this.state.userState.spam
          };
          break;
        case "harassment":
          userState = {
            ...this.state.userState,
            harassment: !this.state.userState.harassment
          };
          break;
        case "rulesviolation":
          userState = {
            ...this.state.userState,
            rulesviolation: !this.state.userState.rulesviolation
          };
          break;
        default:
          alertErr("ReactionContainer: Unknown report button type");
          throw "Unknown report button type";
      }

      const bodyJson: TakeReactionJson.ReactReq = {
        take_id: this.props.takeId,
        userState: userState
      };

      postRequest(
        Routes.API_TAKE_REACT,
        bodyJson,
        (json: TakeReactionJson.ReactRes) => {
          this.setState({
            takeState: json.takeState,
            userState: json.userState
          });
        }
      );
    } else {
      window.location.href =
        Routes.LOGIN +
        "?redirect=" +
        window.location.pathname +
        "&loginreason=You+must+have+an+account+to+report+a+Take.";
    }
  };
  componentDidMount() {
    this.fetchReactions();
  }
  render() {
    const eventListeners = {
      onStarPress: this.starButtonPress,
      onReportPress: this.reportButtonPress
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
  };
}

interface ReactionState {
  subMenuIsOpen: boolean;
}

export class Reaction extends React.Component<ReactionProps, ReactionState> {
  constructor(props: ReactionProps) {
    super(props);

    this.state = {
      subMenuIsOpen: false
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
      subMenuIsOpen: !menuIsOpen
    });
  };
  onMouseDown = (e: MouseEvent) => {
    if (e.target) {
      if (!(e.target as HTMLElement).classList.contains("reaction__action")) {
        this.setState({
          subMenuIsOpen: false
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
          <ShareContainer
            takeDocument={(Object as any).assign(
              {},
              props.containerProps.takeDocument
            )}
          />
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

export default ReactionContainer;
