import * as React from "react";
import Constitution from '../Constitution';
import Debates from '../Debates';

function ConstitutionCard(props: FoundationCardProps){
  return (
    <div className="foundation__card foundation__card--constitution" onClick={props.onClick}>
      <h3 className="foundation__card-title foundation__card-title--constitution">The Constitution</h3>
      <img src={require('../../assets/images/constitution.jpg')} 
        className="foundation__image foundation__image--constitution"
        width="220" 
        height="313" 
      />
    </div>
  )
}

function DebatesCard(props: FoundationCardProps){
  return (
    <div className="foundation__card foundation__card--debates" onClick={props.onClick}>
      <h3 className="foundation__card-title foundation__card-title--debates">The Debates</h3>
      <img src={require('../../assets/images/debates.jpg')} 
        className="foundation__image foundation__image--debates"
        width="220" 
        height="313" 
      />
    </div>
  )
}

export default class Foundation extends React.Component<FoundationProps, FoundationState> {
  constructor(props: FoundationProps){
    super(props);

    this.state = {
      view: 'INITIAL'
    }

    this.handleConstitutionCardClick = this.handleConstitutionCardClick.bind(this);
    this.handleDebatesCardClick = this.handleDebatesCardClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
  }
  handleConstitutionCardClick(){
    this.setState({view: 'CONSTITUTION'});
  }
  handleDebatesCardClick(){
    this.setState({view: 'DEBATES'});
  }
  handleBackClick(){
    this.setState({view: 'INITIAL'});
  }
  render(){
    let { props } = this;
    
    switch (this.state.view){
      case 'INITIAL':
        return (
          <div className="foundation">
            <h2 className="foundation__heading">The Foundation</h2>
            <p className="foundation__instructions">Add some Facts to your Take</p>
            <ConstitutionCard onClick={this.handleConstitutionCardClick} />
            <DebatesCard onClick={this.handleDebatesCardClick} />
          </div>
        );
      case 'CONSTITUTION':
        return (
          <div className="foundation">
            <Constitution 
              onBackClick={this.handleBackClick}
              onClearClick={props.onConstitutionClearClick}
              onSetClick={props.onConstitutionSetClick}
              onMouseUp={props.onConstitutionMouseUp} 
              constitutionNodes={props.constitutionNodes}
              textIsHighlighted={props.textIsHighlighted}
            />
          </div>
        );
      case 'DEBATES':
        return (
          <div className="foundation">
            <Debates 
              onBackClick={this.handleBackClick}
            />
          </div>
        );
      default:
        //impossible
    }
  }
}
