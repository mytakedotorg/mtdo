import * as React from "react";

interface DebatesProps {
  onBackClick: () => void,
}

class Debates extends React.Component<DebatesProps, void> {
  constructor(props: DebatesProps){
    super(props);
  }

  render(){
    return (
      <div className="debates">
        <h2 className="debates__heading">Debates</h2>
        <p className="debates__instructions">Coming soon</p>
        <button onClick={this.props.onBackClick}>
          Back to Foundation
        </button>
        <div className="debates__placeholder">
        </div>
      </div>
    )
  }
}


export default Debates;
