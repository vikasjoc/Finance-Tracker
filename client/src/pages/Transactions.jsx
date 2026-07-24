import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  setFilters,
  exportCSV,
} from '../redux/slices/transactionSlice';
import { getCategories } from '../redux/slices/categorySlice';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDownload, HiOutlinePencil, HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { formatCurrency, formatWithSign } from '../utils/currency';
import useModal from '../hooks/useModal';
import useAsyncAction from '../hooks/useAsyncAction';
import useDebounce from '../hooks/useDebounce';
import FormModal from '../components/FormModal';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';

const PAYMENT_METHODS = ['Cash','Bank Transfer','Credit Card','Debit Card','UPI','Net Banking','Cheque','Wallet','Other'];

const TABLE_HEADERS = ['Date', 'Category', 'Description', 'Payment', 'Amount', 'Actions'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function TransactionRow({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income';

  return (
    <motion.tr
      key={transaction._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-gray-50 dark:hover:bg-dark-850 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(transaction.date)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`badge ${isIncome ? 'badge-success' : 'badge-danger'}`}>
          {transaction.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {transaction.description || '-'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {transaction.paymentMethod}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`font-semibold text-sm ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {formatWithSign(transaction.amount, transaction.type)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction._id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-red-600 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function Pagination({ currentPage, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * 20 + 1;
  const to = Math.min(currentPage * 20, total);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-dark-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {from} to {to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-50"
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              currentPage === i + 1
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-50"
        >
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, total, totalPages, currentPage, loading, filters } = useSelector(
    (state) => state.transactions
  );
  const { categories } = useSelector((state) => state.categories);
  const modal = useModal();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { register, handleSubmit, reset, setValue } = useForm();

  // Fetch on mount and when filters change
  useEffect(() => {
    dispatch(getTransactions(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilters({ search: debouncedSearch, page: 1 }));
    }
  }, [debouncedSearch]);

  const { execute: handleDelete } = useAsyncAction({
    onSuccess: () => {
      toast.success('Transaction deleted');
      dispatch(getTransactions(filters));
    },
    onError: () => toast.error('Failed to delete'),
  });

  const onTransactionDelete = useCallback((id) => {
    if (!window.confirm('Delete this transaction?')) return;
    handleDelete(() => dispatch(deleteTransaction(id)).unwrap());
  }, [dispatch, handleDelete]);

  const openCreate = useCallback(() => {
    modal.open();
    reset({ type: 'expense', date: new Date().toISOString().split('T')[0], paymentMethod: 'Cash' });
  }, [modal, reset]);

  const openEdit = useCallback((transaction) => {
    modal.open(transaction);
    setValue('type', transaction.type);
    setValue('amount', transaction.amount);
    setValue('category', transaction.category);
    setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
    setValue('paymentMethod', transaction.paymentMethod);
    setValue('description', transaction.description || '');
  }, [modal, setValue]);

  const onSubmit = useCallback(async (data) => {
    data.amount = Number(data.amount);
    try {
      if (modal.editingItem) {
        await dispatch(updateTransaction({ id: modal.editingItem._id, ...data })).unwrap();
        toast.success('Transaction updated');
      } else {
        await dispatch(createTransaction(data)).unwrap();
        toast.success('Transaction created');
      }
      modal.close();
      dispatch(getTransactions(filters));
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  }, [dispatch, modal, filters]);

  const handleExport = useCallback(() => {
    dispatch(exportCSV(filters));
    toast.success('Downloading CSV...');
  }, [dispatch, filters]);

  // Memoize category lists
  const expenseCategories = useMemo(
    () => (categories ?? []).filter((c) => c.type === 'expense'),
    [categories]
  );
  const incomeCategories = useMemo(
    () => (categories ?? []).filter((c) => c.type === 'income'),
    [categories]
  );
  const allCategories = useMemo(
    () => categories ?? [],
    [categories]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your income and expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <HiOutlineDownload className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <HiOutlinePlus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => dispatch(setFilters({ type: e.target.value, page: 1 }))}
            className="input-field sm:w-40"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category || ''}
            onChange={(e) => dispatch(setFilters({ category: e.target.value, page: 1 }))}
            className="input-field sm:w-40"
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => dispatch(setFilters({ startDate: e.target.value, page: 1 }))}
            className="input-field sm:w-40"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => dispatch(setFilters({ endDate: e.target.value, page: 1 }))}
            className="input-field sm:w-40"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-850">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className={`text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      h === 'Amount' || h === 'Actions' ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction._id}
                    transaction={transaction}
                    onEdit={openEdit}
                    onDelete={onTransactionDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="📭"
                      title="No transactions found"
                      actionLabel="Add your first transaction"
                      onAction={openCreate}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={(page) => dispatch(setFilters({ page }))}
        />
      </div>

      <FormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.editingItem ? 'Edit Transaction' : 'New Transaction'}
        submitLabel={modal.editingItem ? 'Update' : 'Create Transaction'}
      >
        <form id="modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select {...register('type')} className="input-field">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} className="input-field" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select {...register('category', { required: true })} className="input-field">
              <option value="">Select category</option>
              {(modal.editingItem?.type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input type="date" {...register('date', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select {...register('paymentMethod')} className="input-field">
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input type="text" {...register('description')} className="input-field" placeholder="Brief description" />
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
};

export default Transactions;

