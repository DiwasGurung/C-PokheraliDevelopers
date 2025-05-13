import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockBooks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [isAdmin, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Books</h3>
          <p className="text-3xl font-bold">{stats.totalBooks}</p>
          <button
            onClick={() => navigate('/admin/books')}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
          >
            Manage Books →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
          >
            View Orders →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
          >
            Manage Users →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <button
            onClick={() => navigate('/admin/reports')}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
          >
            View Reports →
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
        </div>
        <div className="p-6">
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Total</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="py-4">#{order.id}</td>
                      <td className="py-4">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="py-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-4">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Books */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Low Stock Books</h2>
        </div>
        <div className="p-6">
          {stats.lowStockBooks.length === 0 ? (
            <p className="text-gray-500">No books with low stock</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4">Book</th>
                    <th className="pb-4">Current Stock</th>
                    <th className="pb-4">Min Stock</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockBooks.map(book => (
                    <tr key={book.id} className="border-t">
                      <td className="py-4">
                        <div className="flex items-center">
                          <img
                            src={book.imageUrl || '/placeholder-book.jpg'}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded mr-3"
                          />
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-gray-500">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{book.currentStock}</td>
                      <td className="py-4">{book.minStock}</td>
                      <td className="py-4">
                        <button
                          onClick={() => navigate(`/admin/books/${book.id}`)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 