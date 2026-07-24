import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout } from '../../redux/slices/authSlice';
import { setSidebarOpen } from '../../redux/slices/uiSlice';
import {
  HiOutlineHome,
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineTag,
  HiOutlineFlag,
  HiOutlineRefresh,
  HiOutlineDocumentReport,
  HiOutlineLightBulb,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineUsers,
  HiOutlineX,
} from 'react-icons/hi';

const sidebarLinks = [
  { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/transactions', icon: HiOutlineCash, label: 'Transactions' },
  { path: '/budgets', icon: HiOutlineChartBar, label: 'Budgets' },
  { path: '/categories', icon: HiOutlineTag, label: 'Categories' },
  { path: '/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
  { path: '/ai', icon: HiOutlineLightBulb, label: 'AI Budget Planner' },
  { path: '/notifications', icon: HiOutlineBell, label: 'Notifications' },
  { path: '/profile', icon: HiOutlineCog, label: 'Settings' },
];

const adminLinks = [
  { path: '/admin', icon: HiOutlineChartBar, label: 'Admin Dashboard' },
  { path: '/admin/users', icon: HiOutlineUsers, label: 'Manage Users' },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed md:relative z-30 h-full w-[280px] bg-white dark:bg-dark-850 border-r border-gray-100 dark:border-dark-700/50 flex flex-col shadow-lg"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-dark-700">
        <NavLink to="/dashboard" className="flex items-center gap-2" onClick={closeSidebar}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">$</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Finance<span className="text-primary-600">Tracker</span>
          </span>
        </NavLink>
        <button
          onClick={() => dispatch(setSidebarOpen(false))}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}

        {/* Admin Links */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Admin
              </p>
            </div>
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{link.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

