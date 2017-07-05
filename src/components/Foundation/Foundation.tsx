import * as React from "react";
import Constitution from '../Constitution';
import Debates from '../Debates';

function ConstitutionCard(props: FoundationCardProps){
  return (
    <div className="foundation__card foundation__card--constitution" onClick={props.onClick}>
      <div className="foundation__image-container">
        <img src={require('../../assets/images/constitution.jpg')} 
          className="foundation__image foundation__image--constitution"
          width="220" 
          height="313" 
        />
      </div>
      <div className="foundation__info-container">
        <h3 className="foundation__card-title foundation__card-title--constitution">The Constitution</h3>
        <p className="foundation__description foundation__description--constitution">The full text of the U.S. Constitution, as it was originally penned in 1787.</p>
      </div>
    </div>
  )
}

function DebatesCard(props: FoundationCardProps){
  return (
    <div className="foundation__card foundation__card--debates" onClick={props.onClick}>
      <div className="foundation__image-container">
        <img src={require('../../assets/images/debates.jpg')} 
          className="foundation__image foundation__image--debates"
          width="220" 
          height="313" 
        />
      </div>
      <div className="foundation__info-container">
        <h3 className="foundation__card-title foundation__card-title--debates">The Debates</h3>
        <p className="foundation__description foundation__description--debates">Full videos and transcripts of all presidential debates since 1976.</p>
      </div>
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
            <p className="foundation__instructions">Browse the Foundation to support your take with Facts.</p>
            <div className="foundation__card-list">
              <ConstitutionCard onClick={this.handleConstitutionCardClick} />
              <DebatesCard onClick={this.handleDebatesCardClick} />
            </div>
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
