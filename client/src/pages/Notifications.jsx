import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../redux/slices/notificationSlice';
import { HiOutlineBell, HiOutlineCheck, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => { dispatch(getNotifications()); }, [dispatch]);

  const getIcon = (type) => {
    const icons = { budget: '📊', bill: '💡', savings: '💰', report: '📈', system: '🔔', goal: '🎯' };
    return icons[type] || '📌';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><HiOutlineBell className="w-6 h-6 text-primary-600" /> Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated with your finances</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => dispatch(markAllAsRead())} className="btn-secondary flex items-center gap-2 text-sm">
            <HiOutlineCheckCircle className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-dark-700">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="p-5"><div className="skeleton h-16 w-full" /></div>)
        ) : notifications.length > 0 ? (
          notifications.map((notification, i) => (
            <motion.div key={notification._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-4 p-5 ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-lg flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.read && (
                  <button onClick={() => dispatch(markAsRead(notification._id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-primary-600" title="Mark as read">
                    <HiOutlineCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => dispatch(deleteNotification(notification._id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-red-500" title="Delete">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">🔔</div>
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
