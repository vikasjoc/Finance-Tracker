const Budget = require('../models/Budget');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all budgets for current month/year
// @route   GET /api/budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month || now.getMonth() + 1;
    const queryYear = year || now.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month: parseInt(queryMonth),
      year: parseInt(queryYear),
    }).sort('category');

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
exports.createBudget = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Check if budget already exists for this category/month/year
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      month: req.body.month,
      year: req.body.year,
      category: req.body.category,
    });

    if (existingBudget) {
      return next(
        new ErrorResponse(
          'Budget already exists for this category in this month/year',
          400
        )
      );
    }

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return next(new ErrorResponse('Budget not found', 404));
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return next(new ErrorResponse('Budget not found', 404));
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set monthly overall budget
// @route   POST /api/budgets/monthly
exports.setMonthlyBudget = async (req, res, next) => {
  try {
    const { totalBudget } = req.body;

    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { monthlyBudget: totalBudget },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { monthlyBudget: user.monthlyBudget },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget summary (for dashboard)
// @route   GET /api/budgets/summary
exports.getBudgetSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month: currentMonth,
      year: currentYear,
    });

    const totalPlanned = budgets.reduce((sum, b) => sum + b.plannedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const budgetLeft = totalPlanned - totalSpent;

    // Get over-budget categories
    const overBudget = budgets
      .filter((b) => b.spentAmount > b.plannedAmount)
      .map((b) => ({
        category: b.category,
        planned: b.plannedAmount,
        spent: b.spentAmount,
        excess: b.spentAmount - b.plannedAmount,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalPlanned,
        totalSpent,
        budgetLeft,
        overBudget,
        budgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

