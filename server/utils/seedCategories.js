const Category = require('../models/Category');

const defaultCategories = [
  // Expense categories
  { name: 'Food & Dining', icon: '🍽️', color: '#ef4444', type: 'expense', isDefault: true },
  { name: 'Transportation', icon: '🚗', color: '#f97316', type: 'expense', isDefault: true },
  { name: 'Rent', icon: '🏠', color: '#eab308', type: 'expense', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#22c55e', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#06b6d4', type: 'expense', isDefault: true },
  { name: 'Bills & Utilities', icon: '💡', color: '#3b82f6', type: 'expense', isDefault: true },
  { name: 'Healthcare', icon: '🏥', color: '#8b5cf6', type: 'expense', isDefault: true },
  { name: 'Education', icon: '📚', color: '#a855f7', type: 'expense', isDefault: true },
  { name: 'Insurance', icon: '🛡️', color: '#ec4899', type: 'expense', isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#14b8a6', type: 'expense', isDefault: true },
  { name: 'Investment', icon: '📈', color: '#10b981', type: 'expense', isDefault: true },
  { name: 'EMI & Loans', icon: '🏦', color: '#f43f5e', type: 'expense', isDefault: true },
  { name: 'Groceries', icon: '🛒', color: '#84cc16', type: 'expense', isDefault: true },
  { name: 'Subscriptions', icon: '📱', color: '#6366f1', type: 'expense', isDefault: true },
  { name: 'Others', icon: '📦', color: '#78716c', type: 'expense', isDefault: true },
  // Income categories
  { name: 'Salary', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
  { name: 'Freelance', icon: '💻', color: '#06b6d4', type: 'income', isDefault: true },
  { name: 'Investment', icon: '📈', color: '#10b981', type: 'income', isDefault: true },
  { name: 'Business', icon: '🏢', color: '#3b82f6', type: 'income', isDefault: true },
  { name: 'Rental Income', icon: '🏘️', color: '#8b5cf6', type: 'income', isDefault: true },
  { name: 'Gifts', icon: '🎁', color: '#ec4899', type: 'income', isDefault: true },
  { name: 'Other Income', icon: '💵', color: '#f97316', type: 'income', isDefault: true },
];

const seedCategories = async () => {
  try {
    await Category.deleteMany({ isDefault: true });
    await Category.insertMany(defaultCategories);
    console.log('Default categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error.message);
  }
};

module.exports = { seedCategories, defaultCategories };

