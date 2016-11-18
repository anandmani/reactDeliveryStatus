import React from 'react';
import {Component} from 'react';
import TrackWidget from './TrackWidget';
require('../../css/style.css');

class App extends Component{

  constructor(){
    super();
    this.checkEnter = this.checkEnter.bind(this);
    this.state = ({orderId : 1});
  }

  checkEnter(event){
    //Make validation that card name is not empty
      if(this.refs.orderId.value.trim() == "");
      else{//If value is not empty, enter is pressed
        if(event.keyCode == 13){
          console.log("enter is pressed");
          this.setState({orderId: this.refs.orderId.value.trim()});
        }

      }
  }

  render(){
    return(
      <div>
        <input type="text" name="orderId" ref="orderId" placeholder="orderId" onKeyDown={this.checkEnter}/>
        <TrackWidget orderId={this.state.orderId}/>
      </div>
    );
  }

}

export default App;
