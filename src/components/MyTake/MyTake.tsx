import * as React from "react";
import TakeEditor from '../TakeEditor';
import Constitution from '../Constitution';

class MyTake extends React.Component<MyTakeProps, MyTakeState> {
  constructor(props: MyTakeProps){
    super(props);
  }
  render(){
    return (
      <div>
        <Constitution />
        <TakeEditor />
      </div>
    )
  }
}


export default MyTake;
