import React from 'react';
import {Component} from 'react';
var moment = require ('moment');
var fileUrl = require('../../../DummyResponse.txt');
//----
// JSON format:
// meta{}--status
//         success
//         message
// result{}--orderId{}---scans[]----{}-----status
//                                         remark
//                                         date
//                                         location
//                             ------{}----status
//                                         remark
//                                         date
//                                         location
//                   ----lateststatus{}----status
//                                         remark
//                                         date
//                                         location
//                                         type
//                   ----shipment_detail{}---pickup_pincode
//                                           pickup_address
//                                           pickup_phone
//                                           drop_address
//                                           order_type
//                                           drop_pincode
//                                           drop_name
//                                           courier_partner
//                                           length
//                                           pickup_name
//                                           breadth: 22
//                                           drop_phone
//                                           height
//                                           cod_value
//                                           weight
//
//-----

class TrackWidget extends Component{
  constructor(){
    super();
    this.username = "testuser";
    this.key = "2e9b19ac-8e1f-41ac-a35b-4cd23f41ae17";
    this.orderJSON = {};
    this.fetchJSON = this.fetchJSON.bind(this);
    this.state = {orderJSON: null};
  }

  fetchJSON(orderId){
      console.log("Making Get Call to Fetch Order Status JSON");
      var getOrder = new XMLHttpRequest();
      // var url = `https://www.clickpost.in/api/v2/track-order/?username=${this.username}&key=${this.key}&waybill=${orderId}`;
      var url = fileUrl;
      getOrder.open("GET", url, true);
      getOrder.onreadystatechange = () =>
      {
        if (getOrder.readyState == XMLHttpRequest.DONE ) { //XMLHttpRequest.DONE = 4. We need to check this because readyState keeps changing and the default status code is 200
              //The above two statements can be replaced by getOrder.onload = () =>    have a look!
              if(getOrder.status === 200)
              {
                   console.log(JSON.parse(getOrder.response));
                   this.setState({orderJSON: JSON.parse(getOrder.response)});
              }
              else{
                console.log("Something went wrong; Status: "+getOrder.status);
              }
          }
      }
      getOrder.send(null);
  }

  componentWillReceiveProps(nextProps){
    console.log("next props",nextProps);
    if(nextProps!=this.props){//Best practice to compare them.
      this.fetchJSON(nextProps.orderId);
    }
  }


  render(){
    console.log("Rendering widget, order id is "+this.props.orderId);
    if(this.state.orderJSON != null && parseInt(Object.keys(this.state.orderJSON["result"])[0])==this.props.orderId){  //The first part checks if JSON is not empty.  The second part checks if JSON for new orderId has been fetched, the condition fails if the JSON belongs to the previous orderId
      console.log(this.state.orderJSON["result"][`${this.props.orderId}`]);
      var scansArray = [...this.state.orderJSON["result"][`${this.props.orderId}`]["scans"]];
      //Sorting Array
      scansArray.sort((obj1,obj2)=>{
        //moment.utc() to convert date string to moment obj
        //obj1<obj2 return -1
        //date1.diff(date) returns positive if date1 < date2
        if(moment.utc(obj1.date).diff( moment.utc(obj2.date) ) <= 0){
          return -1;
        }
        else{
          return 1;
        }
      });
      //Removing duplicates in the Array //Immediately invoked function
      (function removeDuplicates(){
        console.log("removing duplicates");
        for(var i = 0; i< scansArray.length-1; i++){
          //If the date objects are same, assuming they are duplicate entries and removing them from the array
          if( moment.utc(scansArray[i].date).diff( moment.utc(scansArray[i+1].date) ) == 0 ){
            scansArray.splice(i,1);
          }
        }
      })();
      console.log("Sorted, duplicate free array: ",scansArray);

      return(
        <div id="orderStatus">
          <div id="orderDetails">
            <pre>
              Shipment Details:
              <br/>
              <br/>
              {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["pickup_name"]}
              <br/>
              {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["pickup_address"]}
              <br/>
              <br/>
              {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["drop_name"]}
              <br/>
              {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["drop_address"]}
              <br/>
              <br/>
              Box: {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["length"]}x{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["breadth"]}x{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["height"]} cm               {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["weight"]} gm
              <br/>
              <br/>
              Courier Partner: {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["courier_partner"]}
            </pre>
          </div>
          <ul id="trackBar">
            <li id="trackBarApproval">
              <ul>
                <li className="orderScan_ListElement"></li>
                  <li className="orderScan_ListElement"></li>
              </ul>
            </li>

            <li id="trackBarTransition">
              <ul>
                <li className="orderScan_ListElement"></li>
              </ul>
            </li>

            <li id="trackBarDelivery">
              <ul>
                <li className="orderScan_ListElement"></li>
              </ul>
            </li>
          </ul>
        </div>
      );
    }
    else{
      return(
        <div id="orderStatus">Enter valid orderId</div>
      );
    }

  }
}

export default TrackWidget;
