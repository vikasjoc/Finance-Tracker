import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getTransactionStats, exportCSV } from '../redux/slices/transactionSlice';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { HiOutlineDownload, HiOutlineDocumentReport } from 'react-icons/hi';

const Reports = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector((state) => state.transactions);
  const [period, setPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const params = {};
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;
    dispatch(getTransactionStats(params));
  }, [dispatch, dateRange]);

  const handleExport = (format) => {
    if (format === 'csv') {
      dispatch(exportCSV(dateRange));
      toast.success('Downloading CSV...');
    } else {
      toast.success('PDF export coming soon!');
    }
  };

  const incomeExpenseData = {
    labels: stats?.monthlyTrend?.filter(t => t._id.type === 'income').map(t => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return months[t._id.month - 1];
    }) || [],
    datasets: [
      { label: 'Income', data: stats?.monthlyTrend?.filter(t => t._id.type === 'income').map(t => t.total) || [], backgroundColor: '#22c55e', borderRadius: 6 },
      { label: 'Expenses', data: stats?.monthlyTrend?.filter(t => t._id.type === 'expense').map(t => t.total) || [], backgroundColor: '#ef4444', borderRadius: 6 },
    ],
  };

  const categoryData = {
    labels: stats?.categoryStats?.map(c => c._id) || [],
    datasets: [{ data: stats?.categoryStats?.map(c => c.total) || [], backgroundColor: ['#6366f1','#ec4899','#f97316','#22c55e','#06b6d4','#eab308','#8b5cf6','#ef4444','#14b8a6','#78716c'], borderWidth: 0 }],
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><HiOutlineDocumentReport className="w-6 h-6 text-primary-600" /> Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your financial data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="input-field text-sm py-2" />
            <span className="text-gray-400">to</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="input-field text-sm py-2" />
          </div>
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2 text-sm"><HiOutlineDownload className="w-4 h-4" /> CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses Trend</h3>
          <div className="h-80"><Bar data={incomeExpenseData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString('en-IN') } } } }} /></div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="h-80 flex items-center justify-center">
            {stats?.categoryStats?.length > 0 ? (
              <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } }} />
            ) : <p className="text-gray-400">No data available</p>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Income</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{(stats?.totalIncome || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total Expenses</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{(stats?.totalExpenses || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Balance</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{((stats?.totalIncome || 0) - (stats?.totalExpenses || 0)).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Transactions</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats?.categoryStats?.reduce((s, c) => s + c.count, 0) || 0}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;
