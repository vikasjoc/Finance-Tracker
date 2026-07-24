const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all transactions (with pagination, search, sort, filter)
// @route   GET /api/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-date',
      type,
      category,
      startDate,
      endDate,
      paymentMethod,
      search,
      minAmount,
      maxAmount,
      tags,
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (tags) query.tags = { $in: tags.split(',') };

    // Date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Amount range
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Search in description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    let sortObj = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach((field) => {
        if (field.startsWith('-')) {
          sortObj[field.substring(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const transaction = await Transaction.create(req.body);

    // Update budget spent amount if it's an expense
    if (req.body.type === 'expense') {
      const date = new Date(req.body.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          month,
          year,
          category: req.body.category,
        },
        { $inc: { spentAmount: req.body.amount } },
        { upsert: true }
      );
    }

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    // Adjust budget if amount or category changed
    if (req.body.amount || req.body.category || req.body.type) {
      // Remove old amount from budget
      if (transaction.type === 'expense') {
        const oldDate = new Date(transaction.date);
        await Budget.findOneAndUpdate(
          {
            user: req.user.id,
            month: oldDate.getMonth() + 1,
            year: oldDate.getFullYear(),
            category: transaction.category,
          },
          { $inc: { spentAmount: -transaction.amount } }
        );
      }
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Add new amount to budget
    if (req.body.type === 'expense') {
      const newDate = new Date(req.body.date || transaction.date);
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          month: newDate.getMonth() + 1,
          year: newDate.getFullYear(),
          category: req.body.category || transaction.category,
        },
        { $inc: { spentAmount: req.body.amount || transaction.amount } },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    // Remove from budget
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          category: transaction.category,
        },
        { $inc: { spentAmount: -transaction.amount } }
      );
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction stats (for charts)
// @route   GET /api/transactions/stats
exports.getTransactionStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dateFilter = {
      $gte: startDate ? new Date(startDate) : startOfMonth,
      $lte: endDate ? new Date(endDate) : endOfMonth,
    };

    // Get stats
    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Category breakdown
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: dateFilter,
          type: 'expense',
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort('-date')
      .limit(5)
      .lean();

    // Budget comparison
    const currentMonthBudgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const budgetComparison = currentMonthBudgets.map((budget) => {
      const spent = categoryStats.find((c) => c._id === budget.category);
      return {
        category: budget.category,
        planned: budget.plannedAmount,
        spent: spent ? spent.total : 0,
        remaining: budget.plannedAmount - (spent ? spent.total : 0),
      };
    });

    // Calculate balance
    const totalIncome = stats[0]?.totalIncome || 0;
    const totalExpenses = stats[0]?.totalExpenses || 0;
    const balance = totalIncome - totalExpenses;

    // Calculate savings
    const savings = totalIncome - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        balance,
        totalIncome,
        totalExpenses,
        savings,
        budgetComparison,
        categoryStats,
        monthlyTrend,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
exports.exportTransactionsCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query = { user: req.user.id };
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort('-date')
      .lean();

    // Generate CSV
    const headers = [
      'Date',
      'Type',
      'Category',
      'Amount',
      'Payment Method',
      'Description',
      'Tags',
    ];
    const csvRows = [headers.join(',')];

    transactions.forEach((t) => {
      const row = [
        new Date(t.date).toISOString().split('T')[0],
        t.type,
        `"${t.category}"`,
        t.amount,
        `"${t.paymentMethod}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.tags || []).join('; ')}"`,
      ];
      csvRows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv'
    );
    res.status(200).send(csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
};

