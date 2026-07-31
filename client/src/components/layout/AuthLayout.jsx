import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-dark-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Finance<span className="text-primary-600">Tracker</span>
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Take control of your financial future
            </p>
          </div>
          <Outlet />
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-700 to-accent-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:30px_30px]"></div>
        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-7xl mb-6">💰</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Smart Finance Management
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Track expenses, create budgets, achieve financial goals with AI-powered insights and personalized recommendations.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: '📊', label: 'Track Spending' },
                { icon: '🎯', label: 'Set Budgets' },
                { icon: '🤖', label: 'AI Insights' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-white text-sm font-medium">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

