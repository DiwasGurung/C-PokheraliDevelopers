import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimCode, setClaimCode] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderService.cancelOrder(id);
      loadOrderDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleProcessOrder = async () => {
    if (!claimCode) {
      setError('Please enter the claim code');
      return;
    }

    try {
      setProcessing(true);
      await orderService.processOrder(id, claimCode);
      loadOrderDetails();
      setClaimCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!order) {
    return <div className="text-center">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.book.imageUrl || '/placeholder-book.jpg'}
                    alt={item.book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.book.title}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    {item.book.isOnSale && (
                      <p className="text-sm text-red-500">
                        {item.book.discountPercentage}% OFF
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.quantityDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Quantity Discount</span>
                  <span>-${order.quantityDiscount.toFixed(2)}</span>
                </div>
              )}
              {order.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Discount</span>
                  <span>-${order.loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-semibold">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">{order.shippingAddress.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-semibold">{order.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-semibold">{order.shippingAddress.address}</p>
              </div>
              <div>
                <p className="text-gray-600">City</p>
                <p className="font-semibold">{order.shippingAddress.city}</p>
              </div>
              <div>
                <p className="text-gray-600">State</p>
                <p className="font-semibold">{order.shippingAddress.state}</p>
              </div>
              <div>
                <p className="text-gray-600">ZIP Code</p>
                <p className="font-semibold">{order.shippingAddress.zipCode}</p>
              </div>
              <div>
                <p className="text-gray-600">Country</p>
                <p className="font-semibold">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Actions</h2>

            {order.status === 'pending' && (
              <div className="space-y-4">
                <button
                  onClick={handleCancelOrder}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {order.status === 'processing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Code
                  </label>
                  <input
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter claim code"
                  />
                </div>
                <button
                  onClick={handleProcessOrder}
                  disabled={processing}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Process Order'}
                </button>
              </div>
            )}

            {order.status === 'completed' && (
              <div className="text-center text-green-600">
                <p className="font-semibold">Order Completed</p>
                <p className="text-sm">
                  Completed on {new Date(order.completedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="text-center text-red-600">
                <p className="font-semibold">Order Cancelled</p>
                <p className="text-sm">
                  Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 