import * as React from "react";
import * as ReactDOM from "react-dom";
import { Routes } from "../java2ts/Routes";
import { TakeReactionJson } from "../java2ts/TakeReactionJson";
import { postRequest } from "../utils/databaseAPI";

interface ReactionContainerProps {
  takeId: number;
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
        userState: this.state.userState
      };

      postRequest(
        Routes.API_TAKE_REACT,
        bodyJson,
        (json: TakeReactionJson.ReactRes) => {
          console.log(json);
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
        // case "harassment":
        //   userState = {
        //     ...this.state.userState,
        //     harassment: !this.state.userState.harassment
        //   };
        //   break;
        // case "rulesviolation":
        //   userState = {
        //     ...this.state.userState,
        //     rulesviolation: !this.state.userState.rulesviolation
        //   };
        //   break;
        default:
          throw "Unknown report button type";
      }

      const bodyJson: TakeReactionJson.ReactReq = {
        take_id: this.props.takeId,
        userState: this.state.userState
      };

      postRequest(
        Routes.API_TAKE_REACT,
        bodyJson,
        (json: TakeReactionJson.ReactRes) => {
          console.log(json);
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
      <Reaction containerState={this.state} eventListeners={eventListeners} />
    );
  }
}

interface ReactionProps {
  containerState: ReactionContainerState;
  eventListeners: {
    onStarPress: () => any;
    onReportPress: (type: abuseType) => any;
  };
}

export const Reaction: React.StatelessComponent<ReactionProps> = props => {
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
          {props.containerState.userState && props.containerState.userState.like
            ? "Unstar"
            : "Star"}
        </button>
        <button
          className="reaction__action reaction__action--report"
          onClick={() => props.eventListeners.onReportPress("spam")}
          disabled={typeof props.containerState.takeState == "undefined"}
        >
          {props.containerState.userState && props.containerState.userState.spam
            ? "Marked as spam. Unmark?"
            : "Report spam"}
        </button>
        <button
          className="reaction__action reaction__action--report"
          onClick={() => props.eventListeners.onReportPress("harassment")}
          disabled={typeof props.containerState.takeState == "undefined"}
        >
          {props.containerState.userState
            ? // && props.containerState.userState.harassment
              "Marked as harassment. Unmark?"
            : "Report harassment"}
        </button>
        <button
          className="reaction__action reaction__action--report"
          onClick={() => props.eventListeners.onReportPress("rulesviolation")}
          disabled={typeof props.containerState.takeState == "undefined"}
        >
          {props.containerState.userState
            ? // && props.containerState.userState.rulesviolation
              "Marked as rules violation. Unmark?"
            : "Report rules violation"}
        </button>
      </div>
    </div>
  );
};

export default ReactionContainer;
