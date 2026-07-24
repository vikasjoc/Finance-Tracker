const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { seedCategories } = require('./utils/seedCategories');
const User = require('./models/User');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding...');

    // Seed default categories
    await seedCategories();
    console.log('Categories seeded');

    // Create demo admin user
    const adminExists = await User.findOne({ email: 'admin@financetracker.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@financetracker.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
      });
      console.log('Admin user created: admin@financetracker.com / admin123');
    }

    // Create demo user
    const userExists = await User.findOne({ email: 'demo@financetracker.com' });
    if (!userExists) {
      const user = await User.create({
        name: 'Demo User',
        email: 'demo@financetracker.com',
        password: 'demo123',
        isVerified: true,
        monthlyBudget: 50000,
        savingsGoal: 100000,
      });

      // Create sample transactions for demo user
      const categories = await Category.find({ type: 'expense' });
      const now = new Date();
      
      const sampleTransactions = [
        { type: 'income', amount: 50000, category: 'Salary', date: new Date(now.getFullYear(), now.getMonth(), 1), description: 'Monthly salary', paymentMethod: 'Bank Transfer' },
        { type: 'expense', amount: 12000, category: 'Rent', date: new Date(now.getFullYear(), now.getMonth(), 5), description: 'Monthly rent', paymentMethod: 'Bank Transfer' },
        { type: 'expense', amount: 5000, category: 'Food & Dining', date: new Date(now.getFullYear(), now.getMonth(), 3), description: 'Groceries', paymentMethod: 'UPI' },
        { type: 'expense', amount: 2000, category: 'Food & Dining', date: new Date(now.getFullYear(), now.getMonth(), 10), description: 'Restaurant dinner', paymentMethod: 'Credit Card' },
        { type: 'expense', amount: 3000, category: 'Transportation', date: new Date(now.getFullYear(), now.getMonth(), 7), description: 'Fuel', paymentMethod: 'UPI' },
        { type: 'expense', amount: 1500, category: 'Entertainment', date: new Date(now.getFullYear(), now.getMonth(), 12), description: 'Netflix & Spotify', paymentMethod: 'Credit Card' },
        { type: 'expense', amount: 2500, category: 'Shopping', date: new Date(now.getFullYear(), now.getMonth(), 15), description: 'Clothing', paymentMethod: 'Debit Card' },
        { type: 'expense', amount: 3500, category: 'Bills & Utilities', date: new Date(now.getFullYear(), now.getMonth(), 8), description: 'Electricity bill', paymentMethod: 'Net Banking' },
        { type: 'expense', amount: 1500, category: 'Subscriptions', date: new Date(now.getFullYear(), now.getMonth(), 1), description: 'Gym membership', paymentMethod: 'Credit Card' },
        { type: 'expense', amount: 8000, category: 'EMI & Loans', date: new Date(now.getFullYear(), now.getMonth(), 10), description: 'Personal loan EMI', paymentMethod: 'Bank Transfer' },
        { type: 'income', amount: 5000, category: 'Freelance', date: new Date(now.getFullYear(), now.getMonth(), 20), description: 'Freelance project', paymentMethod: 'Bank Transfer' },
      ];

      await Transaction.create(
        sampleTransactions.map((t) => ({ ...t, user: user._id }))
      );

      // Create sample budgets
      const budgetData = [
        { category: 'Rent', plannedAmount: 12000 },
        { category: 'Food & Dining', plannedAmount: 8000 },
        { category: 'Transportation', plannedAmount: 4000 },
        { category: 'Entertainment', plannedAmount: 3000 },
        { category: 'Shopping', plannedAmount: 5000 },
        { category: 'Bills & Utilities', plannedAmount: 5000 },
        { category: 'Subscriptions', plannedAmount: 2000 },
        { category: 'EMI & Loans', plannedAmount: 8000 },
        { category: 'Medical', plannedAmount: 3000 },
      ];

      await Budget.create(
        budgetData.map((b) => ({
          ...b,
          user: user._id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          spentAmount: b.plannedAmount * (0.7 + Math.random() * 0.5),
        }))
      );

      console.log('Demo user created: demo@financetracker.com / demo123');
      console.log('Sample data created for demo user');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@financetracker.com / admin123');
    console.log('   Demo:  demo@financetracker.com / demo123');

    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });

