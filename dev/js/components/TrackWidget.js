import React from 'react';
import {Component} from 'react';
import {OverlayTrigger,Popover} from 'react-bootstrap';
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
    this.renderOrderScans = this.renderOrderScans.bind(this);
    this.state = {orderJSON: null};
  }

  fetchJSON(orderId){
      console.log("Making Get Call to Fetch Order Status JSON");
      var getOrder = new XMLHttpRequest();
      var url = `https://www.clickpost.in/api/v2/track-order/?username=${this.username}&key=${this.key}&waybill=${orderId}`;
      // var url = fileUrl;
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

  renderOrderScans(arr){
    return arr.map((obj,index)=>{
      const dateObj = moment.utc(obj.date);
      const popover = (
        <Popover id="popover-trigger-hover-focus" title={`${obj["status"]}`}>
          {dateObj.format("dddd, MMMM Do YYYY, h:mm:ss a")}
          <br/><br/>
          {obj["location"]}
        </Popover>);
      return(
        <OverlayTrigger key={index} trigger={['hover', 'focus']} placement="bottom" overlay={popover}>
          <li className="orderScan_ListElement" style={{left: `${(150/(arr.length+1))*(index+1)}px`}} onClick={()=>{console.log(obj);}}></li>
        </OverlayTrigger>
      )
    });

  }

  render(){
    console.log("Rendering widget, order id is "+this.props.orderId);
    if(this.state.orderJSON != null && parseInt(Object.keys(this.state.orderJSON["result"])[0])==this.props.orderId){  //The first part checks if JSON is not empty.  The second part checks if JSON for new orderId has been fetched, the condition fails if the JSON belongs to the previous orderId
      console.log(this.state.orderJSON["result"][`${this.props.orderId}`]);
      var scansArray = [...this.state.orderJSON["result"][`${this.props.orderId}`]["scans"]];
      var approvalArray = [];
      var transitionArray = [];
      var deliveryArray = [];

      //Sorting Array
      scansArray.sort((obj1,obj2)=>{
        //moment.utc() to convert date string to moment obj    //obj1<obj2 return -1      //date1.diff(date) returns positive if date1 < date2
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

      //Splitting scanArray into approval, transition and delivery arrays
      (function splitArray(){
        console.log("Splitting scanArray");
        approvalArray = scansArray;
        for(var i =0; i<scansArray.length; i++){
          if(scansArray[i].remark.includes("Picked up")){
            approvalArray = scansArray.splice(0,i+1); //splice affects scansArray itself, therefore need to reset i
            transitionArray = scansArray;
            i=0;
          }
          if(scansArray[i].remark.includes("Out For Delivery")){
            transitionArray = scansArray.splice(0,i);
            deliveryArray = scansArray;
            break;
          }
        }
      })();

      console.log("approval, transition, delivery Arrays",approvalArray,transitionArray,deliveryArray);

      return(
        <div id="orderStatus">
          <div id="orderDetailsHeader">Shipment details</div>
          <div id="orderDetails">
            <table>
              <tbody>
                  <tr>
                    <td><strong>From:</strong></td>
                    <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["pickup_name"]}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["pickup_address"]}</td>
                  </tr>
                  <tr>
                    <td><strong>To:</strong></td>
                    <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["drop_name"]}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["drop_address"]}</td>
                  </tr>
                  <tr>
                    <td><strong>Box:</strong></td>
                    <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["length"]}x{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["breadth"]}x{this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["height"]}cm; {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["weight"]}gm</td>
                  </tr>
                  <tr>
                    <td><strong>Courier Partner:</strong></td>
                    <td> {this.state.orderJSON["result"][`${this.props.orderId}`]["shipment_detail"]["courier_partner"]}</td>
                  </tr>
                </tbody>
            </table>
          </div>
          <div id="trackBarHeaders">
            <div className="trackBarHeader">Approval</div>
            <div className="trackBarHeader">Transition</div>
            <div className="trackBarHeader">Delivery</div>
          </div>
          <ul id="trackBar">
            <li id="trackBarApproval">
              <ul>
                {(approvalArray.length>0)?this.renderOrderScans(approvalArray):null}
              </ul>
            </li>

            <li id="trackBarTransition">
              <ul>
                {(transitionArray.length>0)?this.renderOrderScans(transitionArray):null}
              </ul>
            </li>

            <li id="trackBarDelivery">
              <ul>
                {(deliveryArray.length>0)?this.renderOrderScans(deliveryArray):null}
              </ul>
            </li>
          </ul>
          <div id="latestStatusHeader">Latest status</div>
          <div id="latestStatus">
            <table>
              <tbody>
                <tr>
                  <td><strong>Type: </strong></td>
                  <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["lateststatus"]["type"]}</td>
                </tr>
                <tr>
                  <td><strong>Status: </strong></td>
                  <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["lateststatus"]["status"]}</td>
                </tr>
                <tr>
                <td><strong>Time: </strong></td>
                <td>{ moment.utc(this.state.orderJSON["result"][`${this.props.orderId}`]["lateststatus"]["date"]).format("dddd, MMMM Do YYYY, h:mm:ss a")}</td>
                </tr>
                <tr>
                <td><strong>Location: </strong></td>
                <td>{this.state.orderJSON["result"][`${this.props.orderId}`]["lateststatus"]["location"]}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
