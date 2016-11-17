import React from 'react';
import {Component} from 'react';

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
  }

  fetchJSON(orderId){
    return new Promise((resolve,reject)=>{
      console.log("Making Get Call to Fetch Order Status JSON");
      var getOrder = new XMLHttpRequest();
      var url = `https://www.clickpost.in/api/v2/track-order/?username=${this.username}&key=${this.key}&waybill=${this.props.orderId}`;
      var that = this;
      getOrder.open("GET", url, true);
      getOrder.onreadystatechange = () =>
      {
        if (getOrder.readyState == XMLHttpRequest.DONE ) { //XMLHttpRequest.DONE = 4. We need to check this because readyState keeps changing and the default status code is 200
              //The above two statements can be replaced by getOrder.onload = () =>    have a look!
              if(getOrder.status === 200)
              {

                // //Making a second call here
                //   var secondCall = new XMLHttpRequest();
                //   secondCall.open("GET",url,true);
                //   secondCall.onreadystatechange = () => {
                //     if(secondCall.readyState == 4){
                //       if(secondCall.status == 200){
                //         console.log("2 "+secondCall.responseText);
                //       }
                //     }
                //   }
                //   secondCall.send(null);

                  var result = getOrder.responseText;
                  this.orderJSON = result;
                  console.log("1"+this.orderJSON);
                  resolve(result);
              }
              else{
                console.log("Something went wrong; Status: "+getOrder.status);
                reject(Error(getOrder.status));
              }
          }
      }
      getOrder.send(null);

    });
  }

  render(){
    var res =0 ;
    console.log("Rendering widget, order id is "+this.props.orderId);
    this.fetchJSON(this.props.orderId).then(
      function(response){
        res   = console.log("Returned from promise "+response)
      },
      function(error){
        console.error("Failed!",error);
      }
    );
    console.log("res;::"+res);
    return(
      <div id="orderStatus">
        <div id="orderDetails">

        </div>
        <div id="trackBar">
          <ol id="trackBarApproval">

          </ol>

          <ol id="trackBarTransition">

          </ol>

          <ol id="trackBarDelivery">

          </ol>
        </div>
      </div>
    );
  }
}

export default TrackWidget;
