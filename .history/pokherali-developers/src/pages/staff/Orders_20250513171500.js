import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { staffService } from '../../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [claimCode, setClaimCode] = useState('');

  useEffect(() => {
    if (!isStaff()) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [isStaff, navigate, currentPage, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await staffService.getOrders(currentPage, 10, searchTerm, statusFilter);
      setOrders(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await staffService.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleProcessOrder = async (orderId) => {
    try {
      await staffService.processOrder(orderId, claimCode);
      setClaimCode('');
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Process Orders</h1>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4">
                    <span className="font-medium">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      {order.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={claimCode}
                            onChange={(e) => setClaimCode(e.target.value)}
                            placeholder="Enter claim code"
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleProcessOrder(order.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Process
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/staff/orders/${order.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Orders; 