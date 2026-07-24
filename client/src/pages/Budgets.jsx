import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary } from '../redux/slices/budgetSlice';
import { getCategories } from '../redux/slices/categorySlice';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { formatCurrency } from '../utils/currency';
import useModal from '../hooks/useModal';
import useAsyncAction from '../hooks/useAsyncAction';
import FormModal from '../components/FormModal';
import { CardSkeleton } from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';

function BudgetProgress({ budget }) {
  const spent = budget.spentAmount ?? 0;
  const planned = budget.plannedAmount ?? 0;
  const progress = planned > 0 ? (spent / planned) * 100 : 0;
  const isOver = spent > planned;

  return (
    <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all ${
          isOver ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-primary-500'
        }`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

function StatusBadge({ isOver, progress }) {
  let label, className;
  if (isOver) {
    label = 'Over Budget';
    className = 'badge-danger';
  } else if (progress > 80) {
    label = 'Almost Full';
    className = 'badge-warning';
  } else {
    label = 'On Track';
    className = 'badge-success';
  }
  return <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${className}`}>{label}</span>;
}

const Budgets = () => {
  const dispatch = useDispatch();
  const { budgets, summary, loading } = useSelector((state) => state.budgets);
  const { categories } = useSelector((state) => state.categories);
  const modal = useModal();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(getBudgets());
    dispatch(getBudgetSummary());
    dispatch(getCategories());
  }, [dispatch]);

  const expenseCategories = (categories ?? []).filter((c) => c.type === 'expense');

  const { execute: handleDelete } = useAsyncAction({
    onSuccess: () => {
      toast.success('Budget deleted');
      dispatch(getBudgets());
      dispatch(getBudgetSummary());
    },
    onError: () => toast.error('Failed to delete'),
  });

  const onBudgetDelete = (id) => {
    if (!window.confirm('Delete this budget?')) return;
    handleDelete(() => dispatch(deleteBudget(id)).unwrap());
  };

  const openCreate = () => {
    modal.open();
    reset({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), plannedAmount: '' });
  };

  const openEdit = (budget) => {
    modal.open(budget);
    setValue('category', budget.category);
    setValue('plannedAmount', budget.plannedAmount);
    setValue('month', budget.month);
    setValue('year', budget.year);
  };

  const onSubmit = async (data) => {
    data.plannedAmount = Number(data.plannedAmount);
    try {
      if (modal.editingItem) {
        await dispatch(updateBudget({ id: modal.editingItem._id, ...data })).unwrap();
        toast.success('Budget updated');
      } else {
        await dispatch(createBudget(data)).unwrap();
        toast.success('Budget created');
      }
      modal.close();
      dispatch(getBudgets());
      dispatch(getBudgetSummary());
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Operation failed');
    }
  };

  const budgetLeft = summary?.budgetLeft ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set and manage your monthly budgets</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary?.totalPlanned || 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.totalSpent || 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">Budget Left</p>
          <p className="text-2xl font-bold" style={{ color: budgetLeft >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(budgetLeft)}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-gray-100 dark:border-dark-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Category Budgets</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-dark-700">
          {loading ? (
            <CardSkeleton count={5} />
          ) : (budgets ?? []).length > 0 ? (
            (budgets ?? []).map((budget, i) => {
              const spent = budget.spentAmount ?? 0;
              const planned = budget.plannedAmount ?? 0;
              const progress = planned > 0 ? (spent / planned) * 100 : 0;
              const isOver = spent > planned;

              return (
                <motion.div
                  key={budget._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{budget.category}</span>
                      <StatusBadge isOver={isOver} progress={progress} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(spent)} / {formatCurrency(planned)}
                      </span>
                      <button onClick={() => openEdit(budget)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onBudgetDelete(budget._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-red-500">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <BudgetProgress budget={budget} />
                  <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% used</p>
                </motion.div>
              );
            })
          ) : (
            <EmptyState
              icon="📊"
              title="No budgets set yet"
              actionLabel="Create your first budget"
              onAction={openCreate}
            />
          )}
        </div>
      </div>

      <FormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.editingItem ? 'Edit Budget' : 'New Budget'}
        submitLabel={modal.editingItem ? 'Update' : 'Create Budget'}
      >
        <form id="modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select {...register('category', { required: true })} className="input-field">
              <option value="">Select category</option>
              {expenseCategories.map((c) => (
                <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Monthly Budget Amount</label>
            <input
              type="number"
              step="100"
              {...register('plannedAmount', { required: true, min: 1 })}
              className="input-field"
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <input type="number" min="1" max="12" {...register('month', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input type="number" min="2024" {...register('year', { required: true })} className="input-field" />
            </div>
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
};

export default Budgets;

