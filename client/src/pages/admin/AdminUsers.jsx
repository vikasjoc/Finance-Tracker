import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../utils/axios';
import { HiOutlineSearch, HiOutlineBan, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally { setLoading(false); }
  };

  const handleBlock = async (id) => {
    try {
      await API.put(`/admin/users/${id}/block`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><HiOutlineUsers className="w-6 h-6 text-primary-600" /> Manage Users</h1></div>
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm w-64" placeholder="Search users..." />
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50 dark:bg-dark-850">
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Transactions</th>
            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="skeleton h-8 w-full" /></td></tr>)
            : filtered.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-850">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0)}</div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4"><span className={`badge ${user.role === 'admin' ? 'badge-info' : 'badge-success'}`}>{user.role}</span></td>
                <td className="px-6 py-4"><span className={`badge ${user.isBlocked ? 'badge-danger' : 'badge-success'}`}>{user.isBlocked ? 'Blocked' : 'Active'}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.transactionCount || 0}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleBlock(user._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-yellow-500" title={user.isBlocked ? 'Unblock' : 'Block'}>
                      <HiOutlineBan className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-red-500" title="Delete">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
