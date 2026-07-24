import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../../utils/axios';
import { HiOutlineUsers, HiOutlineCash, HiOutlineChartBar, HiOutlineTrendingUp } from 'react-icons/hi';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get('/admin/analytics');
        setAnalytics(data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div></div>;

  const overview = analytics?.overview || {};
  const monthlyData = {
    labels: analytics?.monthlyStats?.map(m => { const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return months[m._id.month - 1]; }).reverse() || [],
    datasets: [
      { label: 'Income', data: analytics?.monthlyStats?.map(m => m.income).reverse() || [], backgroundColor: '#22c55e', borderRadius: 4 },
      { label: 'Expenses', data: analytics?.monthlyStats?.map(m => m.expenses).reverse() || [], backgroundColor: '#ef4444', borderRadius: 4 },
    ],
  };

  const categoryData = {
    labels: analytics?.topCategories?.map(c => c._id) || [],
    datasets: [{ data: analytics?.topCategories?.map(c => c.total) || [], backgroundColor: ['#6366f1','#ec4899','#f97316','#22c55e','#06b6d4','#eab308','#8b5cf6','#ef4444','#14b8a6','#78716c'] }],
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold mt-1">{overview.totalUsers || 0}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-500">New This Month</p><p className="text-2xl font-bold mt-1 text-green-600">{overview.newUsersThisMonth || 0}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-500">Transactions</p><p className="text-2xl font-bold mt-1">{overview.totalTransactions || 0}</p></div>
        <div className="stat-card"><p className="text-sm text-gray-500">Active Users (7d)</p><p className="text-2xl font-bold mt-1 text-primary-600">{overview.activeUsers || 0}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6"><h3 className="font-semibold mb-4">Monthly Revenue</h3><div className="h-72"><Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
        <div className="card p-6"><h3 className="font-semibold mb-4">Top Categories</h3><div className="h-72 flex items-center justify-center"><Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div></div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
