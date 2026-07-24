import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../redux/slices/categorySlice';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import useModal from '../hooks/useModal';
import useAsyncAction from '../hooks/useAsyncAction';
import FormModal from '../components/FormModal';

const presetIcons = ['💰','💸','🏠','🚗','🍽️','🛍️','🎬','💡','🏥','📚','✈️','📈','🏦','🎁','💻','🏢','🛒','📱','🏘️','🛡️','🎯','📦','💳','🏋️'];
const presetColors = ['#6366f1','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#a855f7','#ec4899','#14b8a6','#78716c'];

function CategoryItem({ category, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: category.color + '20' }}
        >
          {category.icon}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{category.name}</p>
          {category.isDefault && <span className="text-xs text-gray-400">Default</span>}
        </div>
      </div>
      {!category.isDefault && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category._id, category.isDefault)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-red-500"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const Categories = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const modal = useModal();

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const { execute: handleDelete } = useAsyncAction({
    onSuccess: () => {
      toast.success('Category deleted');
      dispatch(getCategories());
    },
    onError: (err) => toast.error(err),
  });

  const onCategoryDelete = (id, isDefault) => {
    if (isDefault) {
      toast.error('Cannot delete default categories');
      return;
    }
    if (window.confirm('Delete this category?')) {
      handleDelete(() => dispatch(deleteCategory(id)).unwrap());
    }
  };

  const onSubmit = async (data) => {
    try {
      if (modal.editingItem) {
        await dispatch(updateCategory({ id: modal.editingItem._id, ...data })).unwrap();
        toast.success('Category updated');
      } else {
        await dispatch(createCategory(data)).unwrap();
        toast.success('Category created');
      }
      modal.close();
      dispatch(getCategories());
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Operation failed');
    }
  };

  const openCreate = () => {
    modal.open();
    reset({ type: 'expense', icon: '📦', color: '#6366f1' });
  };

  const openEdit = (cat) => {
    modal.open(cat);
    setValue('name', cat.name);
    setValue('icon', cat.icon);
    setValue('color', cat.color);
    setValue('type', cat.type);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your transaction categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-5 border-b border-gray-100 dark:border-dark-700">
            <h2 className="font-semibold text-red-600 flex items-center gap-2">💸 Expense Categories</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {expenseCategories.map((cat) => (
              <CategoryItem key={cat._id} category={cat} onEdit={openEdit} onDelete={onCategoryDelete} />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-gray-100 dark:border-dark-700">
            <h2 className="font-semibold text-green-600 flex items-center gap-2">💰 Income Categories</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {incomeCategories.map((cat) => (
              <CategoryItem key={cat._id} category={cat} onEdit={openEdit} onDelete={onCategoryDelete} />
            ))}
          </div>
        </div>
      </div>

      <FormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.editingItem ? 'Edit Category' : 'New Category'}
        submitLabel={modal.editingItem ? 'Update' : 'Create'}
      >
        <form id="modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" {...register('name', { required: true })} className="input-field" placeholder="Category name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select {...register('type')} className="input-field">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {presetIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue('icon', icon)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    selectedIcon === icon
                      ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-110'
                      : 'hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-9 h-9 rounded-lg transition-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
};

export default Categories;

