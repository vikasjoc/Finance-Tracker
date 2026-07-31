import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { updateProfile, updatePassword } from '../redux/slices/authSlice';
import { setTheme } from '../redux/slices/uiSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors } } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch: watchPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        currency: user.currency || 'INR',
        monthlyBudget: user.monthlyBudget || 0,
        savingsGoal: user.savingsGoal || 0,
        emergencyFundGoal: user.emergencyFundGoal || 0,
        investmentGoal: user.investmentGoal || 0,
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err || 'Update failed');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await dispatch(updatePassword(data)).unwrap();
      toast.success('Password updated');
      resetPassword();
    } catch (err) {
      toast.error(err || 'Update failed');
    }
  };

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
        <p className="text-gray-500">{user?.email}</p>
        <span className="inline-block mt-2 badge badge-info">{user?.role}</span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input type="text" {...registerProfile('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" {...registerProfile('email', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input type="text" {...registerProfile('phone')} className="input-field" placeholder="+91 **********" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select {...registerProfile('currency')} className="input-field">
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">Save Changes</button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Theme:</span>
            <button type="button" onClick={() => dispatch(setTheme('light'))} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600'}`}>Light</button>
            <button type="button" onClick={() => dispatch(setTheme('dark'))} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600'}`}>Dark</button>
          </div>
        </div>
      </form>

      {/* Financial Goals */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Monthly Budget (₹)</label>
            <input type="number" {...registerProfile('monthlyBudget')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Savings Goal (₹)</label>
            <input type="number" {...registerProfile('savingsGoal')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Emergency Fund (₹)</label>
            <input type="number" {...registerProfile('emergencyFundGoal')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Investment Goal (₹)</label>
            <input type="number" {...registerProfile('investmentGoal')} className="input-field" />
          </div>
        </div>
        <button type="submit" className="btn-primary">Save Goals</button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input type="password" {...registerPassword('currentPassword', { required: 'Required' })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input type="password" {...registerPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New</label>
            <input type="password" {...registerPassword('confirmPassword', { validate: (v) => v === watchPassword('newPassword') || 'Passwords do not match' })} className="input-field" />
          </div>
        </div>
        {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>}
        <button type="submit" className="btn-primary">Update Password</button>
      </form>
    </motion.div>
  );
};

export default Profile;
