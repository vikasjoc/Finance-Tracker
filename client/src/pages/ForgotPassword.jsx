import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError, clearMessage } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      setSent(true);
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const onSubmit = (data) => {
    dispatch(forgotPassword(data.email));
  };

  return (
    <div>
      {sent ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            We've sent password reset instructions to your email.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Forgot password?
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="input-field"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

