const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const AIConversation = require('../models/AIConversation');
const {
  extractFinancialData,
  generateBudget,
  generateInsights,
  generateChatResponse,
} = require('../utils/aiEngine');

// @desc    AI Budget Planner - parse natural language and generate budget
// @route   POST /api/ai/budget-planner
exports.budgetPlanner = async (req, res, next) => {
  try {
    const { message, mode = 'balanced' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message describing your finances',
      });
    }

    // Extract financial data from natural language
    const financialData = extractFinancialData(message);

    if (!financialData.income && !financialData.expenses.length) {
      return res.status(400).json({
        success: false,
        error:
          'Could not extract financial information. Please mention your income and expenses. Example: "I earn ₹50,000, my rent is ₹12,000, and I spend ₹5,000 on food"',
      });
    }

    // Generate budget based on extracted data
    const budget = generateBudget(financialData, mode);

    // Save conversation
    await AIConversation.create({
      user: req.user.id,
      messages: [
        { role: 'user', content: message, timestamp: new Date() },
        {
          role: 'assistant',
          content: budget.summary,
          timestamp: new Date(),
        },
      ],
      title: `Budget Plan - ${new Date().toLocaleDateString()}`,
      type: 'budget-planner',
    });

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Financial Insights - analyze spending patterns
// @route   POST /api/ai/insights
exports.getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month transactions
    const currentTransactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean();

    // Get last month transactions for comparison
    const lastMonthTransactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }).lean();

    // Get budgets
    const budgets = await Budget.find({
      user: req.user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }).lean();

    // Generate insights
    const insights = generateInsights(currentTransactions, lastMonthTransactions);

    // Budget exceed insights
    const budgetExceeds = budgets
      .filter((b) => b.spentAmount > b.plannedAmount && b.plannedAmount > 0)
      .map((b) => ({
        type: 'warning',
        message: `You exceeded your ${b.category} budget by ₹${(b.spentAmount - b.plannedAmount).toLocaleString('en-IN')}.`,
        icon: '⚠️',
      }));

    // Calculate totals
    const totalIncome = currentTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Savings progress
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        insights: [...insights, ...budgetExceeds],
        summary: {
          totalIncome,
          totalExpenses,
          savings,
          savingsRate: Math.round(savingsRate),
          transactionCount: currentTransactions.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Smart Chat - financial advice
// @route   POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message',
      });
    }

    // Get user context for personalized responses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentTransactions = await Transaction.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean();

    const totalIncome = currentTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Generate response
    const response = generateChatResponse(message, {
      income: totalIncome,
      expenses: totalExpenses,
      mode: req.user.budgetMode || 'balanced',
    });

    // Save/update conversation
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: conversationId,
        user: req.user.id,
      });
    }

    if (conversation) {
      conversation.messages.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      );
      await conversation.save();
    } else {
      conversation = await AIConversation.create({
        user: req.user.id,
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: response, timestamp: new Date() },
        ],
        title: message.substring(0, 50),
        type: 'chat',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        response,
        conversationId: conversation._id,
        context: {
          totalIncome,
          totalExpenses,
          savings: totalIncome - totalExpenses,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation history
// @route   GET /api/ai/conversations
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({ user: req.user.id })
      .sort('-updatedAt')
      .select('title type createdAt updatedAt')
      .lean();

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation
// @route   GET /api/ai/conversations/:id
exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete conversation
// @route   DELETE /api/ai/conversations/:id
exports.deleteConversation = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    next(error);
  }
};

