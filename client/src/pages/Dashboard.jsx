import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineCash,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCreditCard,
  HiOutlineChartSquareBar,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getTransactionStats } from '../redux/slices/transactionSlice';
import { getInsights } from '../redux/slices/aiSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="stat-card"
  >
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="skeleton w-12 h-12" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-6 w-32" />
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-4">
          <div className="stat-icon" style={{ backgroundColor: color + '20', color }}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          ₹{value.toLocaleString('en-IN')}
        </p>
      </>
    )}
  </motion.div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector((state) => state.transactions);
  const { insights } = useSelector((state) => state.ai);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTransactionStats());
    dispatch(getInsights());
  }, [dispatch]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { callback: (value) => '₹' + value.toLocaleString('en-IN') },
      },
      x: { grid: { display: false } },
    },
  };

  const incomeVsExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      label: 'Amount',
      data: [stats?.totalIncome || 0, stats?.totalExpenses || 0],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderRadius: 8,
      barThickness: 60,
    }],
  };

  const monthlyTrendData = {
    labels: stats?.monthlyTrend
      ?.filter((t) => t._id.type === 'expense')
      .map((t) => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[t._id.month - 1];
      }) || [],
    datasets: [
      {
        label: 'Income',
        data: stats?.monthlyTrend?.filter((t) => t._id.type === 'income').map((t) => t.total) || [],
        borderColor: '#22c55e',
        backgroundColor: '#22c55e20',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: stats?.monthlyTrend?.filter((t) => t._id.type === 'expense').map((t) => t.total) || [],
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: stats?.categoryStats?.map((c) => c._id) || [],
    datasets: [{
      data: stats?.categoryStats?.map((c) => c.total) || [],
      backgroundColor: ['#6366f1','#ec4899','#f97316','#22c55e','#06b6d4','#eab308','#8b5cf6','#ef4444','#14b8a6','#78716c'],
      borderWidth: 0,
    }],
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's your financial overview for this month
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiOutlineCurrencyRupee} label="Current Balance" value={stats?.balance || 0} color="#6366f1" loading={statsLoading} />
        <StatCard icon={HiOutlineTrendingUp} label="Monthly Income" value={stats?.totalIncome || 0} color="#22c55e" loading={statsLoading} />
        <StatCard icon={HiOutlineTrendingDown} label="Monthly Expenses" value={stats?.totalExpenses || 0} color="#ef4444" loading={statsLoading} />
        <StatCard icon={HiOutlineChartSquareBar} label="Budget Left" value={stats?.balance > 0 ? stats.balance : 0} color="#f97316" loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
          <div className="h-64"><Bar data={incomeVsExpenseData} options={chartOptions} /></div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
          <div className="h-64"><Line data={monthlyTrendData} options={chartOptions} /></div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {stats?.categoryStats?.length > 0 ? (
              <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } } }} />
            ) : (
              <p className="text-gray-400">No data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-500">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentTransactions?.length > 0 ? (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No transactions yet</p>
                <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-500 mt-2 inline-block">Add your first transaction</Link>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights 🤖</h3>
            <Link to="/ai" className="text-sm font-medium text-primary-600 hover:text-primary-500">View AI</Link>
          </div>
          <div className="space-y-3">
            {insights?.length > 0 ? (
              insights.slice(0, 4).map((insight, i) => (
                <div key={i} className={`p-3 rounded-xl ${insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' : insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{insight.icon}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">Add transactions to get insights</p>
                <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-500">Start tracking expenses</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

