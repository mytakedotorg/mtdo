import * as React from "react";
import config from "./config";

class Constitution extends React.Component<ConstitutionProps, ConstitutionState> {
  constructor(props: ConstitutionProps){
    super(props);
    this.state = {
      constitution: config.constitution
    }
  }
  onDragStart(ev: MyDragEvent): void{
    console.log((ev.target as HTMLLIElement).id);
    //ev.dataTransfer.setData('text', ev.target.id);
  }
  render(){
    let that: any = this;
    return (
      <div>
        <p>Constitution</p>
        <ul>
        {Object.keys(this.state.constitution).map(function(key: string, index: number){
          return (<li id={key} key={index} draggable={true} onDragStart={that.onDragStart}>{key}</li>);
        })}
        </ul>
      </div>
    )
  }
}


export default Constitution;
