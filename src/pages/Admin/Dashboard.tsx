import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const chartData = stats ? [
    {
      name: 'Transactions',
      Successful: stats.success_transactions,
      Failed: stats.total_transactions - stats.success_transactions,
    }
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users || 0}</p>
            </div>
            <div className="text-teal-600 text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_transactions || 0}</p>
            </div>
            <div className="text-blue-600 text-4xl">💳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats?.success_transactions || 0}</p>
            </div>
            <div className="text-green-600 text-4xl">✓</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                Rp{(stats?.total_revenue || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-yellow-600 text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Successful" fill="#10b981" />
            <Bar dataKey="Failed" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/products" className="bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-bold">Manage Products</h3>
          <p className="text-sm mt-2 opacity-90">Add, edit, or delete products</p>
        </a>

        <a href="/admin/vouchers" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-bold">Manage Vouchers</h3>
          <p className="text-sm mt-2 opacity-90">Create and manage discount codes</p>
        </a>

        <a href="/admin/orders" className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-bold">Manage Orders</h3>
          <p className="text-sm mt-2 opacity-90">View and manage custom orders</p>
        </a>
      </div>
    </div>
  );
};
