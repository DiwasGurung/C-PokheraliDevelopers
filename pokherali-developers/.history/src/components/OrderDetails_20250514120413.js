import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7126/orderHub")  // Make sure this matches your backend URL
      .build();

    connection.on("ReceiveOrderDetails", (orderNumber, bookTitles) => {
      console.log("Order received:", orderNumber, bookTitles);
      // Handle the received order details (you can update the state or trigger a UI update)
      setOrderDetails({ orderNumber, bookTitles });
    });

    connection.start()
      .then(() => {
        console.log("SignalR Connected");
      })
      .catch(err => {
        console.error("SignalR connection failed: ", err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div>
      {orderDetails ? (
        <div>
          <h2>Order Number: {orderDetails.orderNumber}</h2>
          <p>Books in Order: {orderDetails.bookTitles}</p>
        </div>
      ) : (
        <p>No order details received.</p>
      )}
    </div>
  );
};

export default OrderDetails;
