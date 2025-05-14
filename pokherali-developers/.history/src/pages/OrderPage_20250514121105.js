import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Package, Truck, Clock, FileText } from 'lucide-react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [processingCancel, setProcessingCancel] = useState(null);

  const navigate = useNavigate();
  const { orderId } = useParams(); // In case we want to directly open a specific order

  useEffect(() => {
    fetchOrders();

    // If there's an orderId in the URL, expand that order
    if (orderId) {
      setExpandedOrderId(parseInt(orderId, 10));
    }

    // Set up SignalR connection for real-time updates
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7126/orderHub")  // Your SignalR Hub URL
      .build();

    connection.on("ReceiveOrderDetails", (orderNumber, bookTitles) => {
      console.log('Received updated order details:', orderNumber, bookTitles);
      
      // Update the orders state when receiving real-time order details
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.orderNumber === orderNumber) {
            return {
              ...order,
              bookTitles: bookTitles,
              status: 'Completed' // You can adjust the status if necessary
            };
          }
          return order;
        });
      });
    });

    connection.start()
      .then(() => console.log("SignalR Connected"))
      .catch(err => console.error("SignalR connection failed:", err));

    return () => {
      connection.stop();
    };
  }, [orderId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7126/api/Orders', {
        withCredentials: true
      });
      console.log('Fetched orders:', response.data);

      // Map the response data to ensure correct format
      const updatedOrders = response.data.map(order => ({
        ...order,
        orderItems: order.items || [], // Ensure items are correctly mapped
        orderStatus: order.status || 'Pending', // Ensure status is valid
      }));

      setOrders(updatedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrder = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setProcessingCancel(orderId);

    try {
      await axios.put(`https://localhost:7126/api/Orders/${orderId}/cancel`, {}, {
        withCredentials: true
      });

      // Refresh the orders list
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. ' + (err.response?.data || 'Please try again later.'));
    } finally {
      setProcessingCancel(null);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for order status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="text-yellow-500" />;
      case 'confirmed':
        return <Package className="text-blue-500" />;
      case 'shipped':
        return <Truck className="text-purple-500" />;
      case 'completed':
        return <CheckCircle className="text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="text-red-500" />;
      default:
        return <FileText className="text-gray-500" />;
    }
  };

  // Helper for status badge color
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Error Loading Orders</h2>
          <p>{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No Orders Yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Order Header */}
            <div
              className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer"
              onClick={() => handleToggleOrder(order.id)}
            >
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                <div className="ml-3">
                  <h3 className="font-medium">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <span className={`mr-4 inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
                <span className="mr-4 font-medium">${order.totalAmount.toFixed(2)}</span>
                {expandedOrderId === order.id ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
            </div>

            {/* Order Details */}
            {expandedOrderId === order.id && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Shipping Information</h4>
                    <p>{order.shippingAddress}</p>
                    <p>{order.shippingCity}, {order.shippingState} {order.shippingZipCode}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Order Details</h4>
                    {order.claimCode && (
                      <p>
                        <span className="font-medium">Claim Code:</span>{' '}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.claimCode}</span>
                      </p>
                    )}
                  </div>
                </div>

                <h4 className="font-medium border-b pb-2 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.bookId} className="flex items-center border-b border-gray-100 pb-3">
                      <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <FileText size={16} className="text-gray-400" />
                      </div>

                      <div className="ml-4 flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span>Qty: {item.quantity}</span>
                          <span>${item.unitPrice.toFixed(2)} each</span>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <p className="font-medium">${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal:</span>
                    <span>${order.subTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                  {(order.status === 'Pending' || order.status === 'Confirmed') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={processingCancel === order.id}
                      className="text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50 ml-2 flex items-center"
                    >
                      {processingCancel === order.id ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} className="mr-1" />
                          Cancel Order
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
