/**
 * AI Budget Planner Engine
 * Natural Language Processing for financial data extraction and budget generation
 */

// Extract financial data from natural language messages
const extractFinancialData = (message) => {
  const data = {
    income: 0,
    expenses: [],
    bills: [],
    savingsGoal: 0,
    investments: [],
    loans: [],
    recurringExpenses: [],
    totalExpenses: 0,
  };

  const lowerMessage = message.toLowerCase();

  // Extract income
  const incomePatterns = [
    /(?:i\s+)?(?:earn|make|get|receive|have)\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
    /(?:my\s+)?(?:monthly\s+)?income\s+(?:is|of)\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
    /(?:salary|wage)\s+(?:is|of)\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
    /(?:total\s+)?budget\s+(?:is|of)\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
  ];

  for (const pattern of incomePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      data.income = parseAmount(match[1]);
      break;
    }
  }

  // Extract expenses with categories
  const expensePatterns = [
    { pattern: /(?:rent|rental)\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Rent' },
    { pattern: /(?:food|groceries|dining)\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Food' },
    { pattern: /(?:travel|transport|commute|fuel|petrol)\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Transportation' },
    { pattern: /(?:electricity|water|gas|utility|utilities)\s+(?:bill\s+)?(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Utilities' },
    { pattern: /(?:entertainment|movies|fun|recreation)\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Entertainment' },
    { pattern: /(?:shopping|clothes|online\s+shopping)\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Shopping' },
    { pattern: /(?:education|tuition|school|college)\s+(?:fee|cost|is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Education' },
    { pattern: /(?:medical|health|healthcare|doctor|hospital)\s+(?:bill\s+)?(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Medical' },
    { pattern: /(?:insurance|health\s+insurance|life\s+insurance)\s+(?:premium\s+)?(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Insurance' },
    { pattern: /(?:gym|fitness|subscription)\s+(?:fee|cost|is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i, category: 'Subscription' },
  ];

  for (const { pattern, category } of expensePatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const amount = parseAmount(match[1]);
      data.expenses.push({ category, amount });
      data.totalExpenses += amount;
    }
  }

  // Extract savings goal
  const savingsPatterns = [
    /(?:i\s+)?(?:want\s+to\s+)?save\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
    /(?:savings?\s+)?(?:goal|target)\s+(?:is|of)\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
  ];

  for (const pattern of savingsPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      data.savingsGoal = parseAmount(match[1]);
      break;
    }
  }

  // Extract loan/EMI
  const loanPatterns = [
    /(?:loan\s+)?emi\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
    /(?:loan|personal\s+loan|home\s+loan|car\s+loan)\s+(?:repayment|payment|emi)\s+(?:is|of|:)?\s*(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i,
  ];

  for (const pattern of loanPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      data.loans.push({ amount: parseAmount(match[1]) });
    }
  }

  // Extract recurring expenses
  const recurringPatterns = [
    /(?:spend|spends?|cost|costs?)\s+(?:around\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s+(?:on\s+)?(?:monthly\s+)?(.+)/i,
  ];

  for (const pattern of recurringPatterns) {
    const match = lowerMessage.match(pattern);
    if (match && !data.expenses.some(e => e.category.toLowerCase() === match[2]?.trim().toLowerCase())) {
      data.recurringExpenses.push({
        category: match[2]?.trim() || 'Other',
        amount: parseAmount(match[1]),
      });
    }
  }

  // If recurring is mentioned
  if (lowerMessage.includes('recurring')) {
    // Try to find amounts mentioned
    const amounts = [...lowerMessage.matchAll(/(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/g)];
    amounts.forEach(m => {
      const amt = parseAmount(m[1]);
      if (amt > 0 && !data.expenses.some(e => e.amount === amt)) {
        // Could be recurring
      }
    });
  }

  return data;
};

// Parse amount from string (handles commas)
const parseAmount = (str) => {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, '').replace(/[₹rs.\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Generate budget based on extracted data and mode
const generateBudget = (data, mode = 'balanced') => {
  const { income, expenses, savingsGoal, loans } = data;
  
  // Calculate total known expenses and loan payments
  const totalKnownExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLoanPayments = loans.reduce((sum, l) => sum + l.amount, 0);

  // Budget allocation ratios based on mode
  const ratios = {
    conservative: { needs: 0.60, wants: 0.25, savings: 0.15 },
    balanced: { needs: 0.50, wants: 0.30, savings: 0.20 },
    aggressive: { needs: 0.40, wants: 0.20, savings: 0.40 },
  };

  const ratio = ratios[mode] || ratios.balanced;

  // Calculate available income after loan payments
  const availableIncome = income - totalLoanPayments;
  
  // Budget allocations
  const needsBudget = availableIncome * ratio.needs;
  const wantsBudget = availableIncome * ratio.wants;
  const savingsBudget = availableIncome * ratio.savings;

  // Create detailed budget breakdown
  const budgetBreakdown = [];

  // Needs categories (50% or adjusted)
  const needsCategories = [
    { name: 'Rent', minAmount: 0, suggestedPercent: 0.25, essential: true },
    { name: 'Food', minAmount: 0, suggestedPercent: 0.15, essential: true },
    { name: 'Transportation', minAmount: 0, suggestedPercent: 0.08, essential: true },
    { name: 'Utilities', minAmount: 0, suggestedPercent: 0.05, essential: true },
    { name: 'Insurance', minAmount: 0, suggestedPercent: 0.03, essential: true },
    { name: 'Medical', minAmount: 0, suggestedPercent: 0.04, essential: true },
  ];

  // Check if user mentioned specific amounts for needs
  const userMentions = {};
  for (const expense of expenses) {
    const cat = expense.category.toLowerCase();
    if (cat === 'food' || cat === 'groceries') userMentions['Food'] = expense.amount;
    else if (cat === 'rent') userMentions['Rent'] = expense.amount;
    else if (cat === 'transportation' || cat === 'travel') userMentions['Transportation'] = expense.amount;
    else if (cat === 'utilities') userMentions['Utilities'] = expense.amount;
    else if (cat === 'insurance') userMentions['Insurance'] = expense.amount;
    else if (cat === 'medical') userMentions['Medical'] = expense.amount;
  }

  // Build needs budget
  let totalNeedsAllocated = 0;
  for (const cat of needsCategories) {
    let amount = userMentions[cat.name] || Math.round(needsBudget * cat.suggestedPercent);
    if (totalNeedsAllocated + amount > needsBudget && !userMentions[cat.name]) {
      amount = Math.max(0, needsBudget - totalNeedsAllocated);
    }
    totalNeedsAllocated += amount;
    const reason = userMentions[cat.name]
      ? `Based on your mentioned spending of ₹${amount.toLocaleString('en-IN')}`
      : `Allocated ${Math.round(cat.suggestedPercent * 100)}% of your needs budget for essential ${cat.name.toLowerCase()}`;
    
    budgetBreakdown.push({ category: cat.name, amount, type: 'Needs', reason });
  }

  // Wants categories
  const wantsCategories = [
    { name: 'Entertainment', suggestedPercent: 0.08 },
    { name: 'Shopping', suggestedPercent: 0.08 },
    { name: 'Dining Out', suggestedPercent: 0.06 },
    { name: 'Travel', suggestedPercent: 0.05 },
    { name: 'Subscriptions', suggestedPercent: 0.03 },
  ];

  // Check user mentions for wants
  for (const expense of expenses) {
    const cat = expense.category.toLowerCase();
    if (cat === 'entertainment' || cat === 'movies') userMentions['Entertainment'] = expense.amount;
    else if (cat === 'shopping') userMentions['Shopping'] = expense.amount;
    else if (cat === 'travel') userMentions['Travel'] = expense.amount;
    else if (cat === 'subscription') userMentions['Subscriptions'] = expense.amount;
  }

  let totalWantsAllocated = 0;
  for (const cat of wantsCategories) {
    let amount = userMentions[cat.name] || Math.round(wantsBudget * cat.suggestedPercent);
    if (totalWantsAllocated + amount > wantsBudget && !userMentions[cat.name]) {
      amount = Math.max(0, wantsBudget - totalWantsAllocated);
    }
    totalWantsAllocated += amount;
    const reason = userMentions[cat.name]
      ? `Based on your mentioned spending of ₹${amount.toLocaleString('en-IN')}`
      : `Set aside ${Math.round(cat.suggestedPercent * 100)}% of your wants budget for ${cat.name.toLowerCase()}`;
    
    budgetBreakdown.push({ category: cat.name, amount, type: 'Wants', reason });
  }

  // Savings & Investments
  const savingsAllocation = Math.round(savingsBudget * 0.5);
  const emergencyFundAllocation = Math.round(savingsBudget * 0.25);
  const investmentAllocation = savingsBudget - savingsAllocation - emergencyFundAllocation;

  budgetBreakdown.push({
    category: 'Emergency Fund',
    amount: emergencyFundAllocation,
    type: 'Savings',
    reason: `Built an emergency fund of ₹${emergencyFundAllocation.toLocaleString('en-IN')} (${Math.round(emergencyFundAllocation / availableIncome * 100)}% of income) to cover unexpected expenses`,
  });

  budgetBreakdown.push({
    category: 'Investment',
    amount: investmentAllocation,
    type: 'Savings',
    reason: `Allocated ₹${investmentAllocation.toLocaleString('en-IN')} for investments to grow your wealth over time`,
  });

  budgetBreakdown.push({
    category: 'Savings',
    amount: savingsAllocation,
    type: 'Savings',
    reason: `Saved ₹${savingsAllocation.toLocaleString('en-IN')} (${Math.round(savingsAllocation / availableIncome * 100)}% of income) towards your financial goals`,
  });

  // Loan payments (if any)
  if (totalLoanPayments > 0) {
    budgetBreakdown.push({
      category: 'Loan EMI',
      amount: totalLoanPayments,
      type: 'Debt',
      reason: `Loan repayment of ₹${totalLoanPayments.toLocaleString('en-IN')} to stay on track with debt reduction`,
    });
  }

  // Calculate total and remaining
  const totalAllocated = budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const remaining = availableIncome - totalAllocated;

  // Generate summary
  const summary = generateSummary(budgetBreakdown, income, totalLoanPayments, availableIncome, mode);

  return {
    monthlyIncome: income,
    availableIncome,
    totalExpenses: totalKnownExpenses,
    totalLoanPayments,
    mode,
    breakdown: budgetBreakdown,
    totalAllocated,
    remaining: Math.max(0, remaining),
    summary,
    savingsRate: Math.round((savingsAllocation + emergencyFundAllocation + investmentAllocation) / availableIncome * 100),
  };
};

// Generate human-readable summary
const generateSummary = (breakdown, income, loans, availableIncome, mode) => {
  const name = mode.charAt(0).toUpperCase() + mode.slice(1);
  
  let summary = `## ${name} Budget Plan\n\n`;
  
  if (income > 0) {
    summary += `Based on your monthly income of **₹${income.toLocaleString('en-IN')}**, `;
    if (loans > 0) {
      summary += `after accounting for loan payments of ₹${loans.toLocaleString('en-IN')}, `;
    }
    summary += `here's your optimized budget.\n\n`;

    // Find key items
    const needsTotal = breakdown.filter(b => b.type === 'Needs').reduce((s, b) => s + b.amount, 0);
    const wantsTotal = breakdown.filter(b => b.type === 'Wants').reduce((s, b) => s + b.amount, 0);
    const savingsTotal = breakdown.filter(b => b.type === 'Savings').reduce((s, b) => s + b.amount, 0);

    const needsPercent = Math.round(needsTotal / availableIncome * 100);
    const wantsPercent = Math.round(wantsTotal / availableIncome * 100);
    const savingsPercent = Math.round(savingsTotal / availableIncome * 100);

    summary += `### 💰 Allocation Summary\n`;
    summary += `- **Needs**: ₹${needsTotal.toLocaleString('en-IN')} (${needsPercent}%)\n`;
    summary += `- **Wants**: ₹${wantsTotal.toLocaleString('en-IN')} (${wantsPercent}%)\n`;
    summary += `- **Savings**: ₹${savingsTotal.toLocaleString('en-IN')} (${savingsPercent}%)\n\n`;

    // Mode-specific advice
    if (mode === 'conservative') {
      summary += `### 📊 Conservative Approach\n`;
      summary += `This budget prioritizes essential needs and careful spending. ${needsPercent}% goes to necessities, allowing you to maintain a comfortable lifestyle while still saving ${savingsPercent}%. This is ideal if you prefer financial security and minimizing risk.\n\n`;
    } else if (mode === 'balanced') {
      summary += `### ⚖️ Balanced Approach\n`;
      summary += `This 50/30/20 budget provides a healthy balance between needs, wants, and savings. You're allocating ${savingsPercent}% toward your financial future while still enjoying ${wantsPercent}% for lifestyle expenses. This sustainable approach works well for most people.\n\n`;
    } else if (mode === 'aggressive') {
      summary += `### 🚀 Aggressive Saving Approach\n`;
      summary += `This budget maximizes your savings rate at ${savingsPercent}%. By keeping wants at ${wantsPercent}%, you're prioritizing long-term wealth building. This approach helps you reach financial goals faster but requires discipline.\n\n`;
    }

    // Add specific category insights
    const topExpenses = [...breakdown].sort((a, b) => b.amount - a.amount).slice(0, 3);
    summary += `### 💡 Key Insights\n`;
    summary += `- Your largest expense category is **${topExpenses[0]?.category}** at ₹${topExpenses[0]?.amount?.toLocaleString('en-IN')}\n`;
    summary += `- You're saving **${savingsPercent}%** of your income, which is ${savingsPercent >= 20 ? 'excellent' : savingsPercent >= 15 ? 'good' : 'an area to improve'}!\n`;
    
    if (needsPercent > 50 && mode !== 'conservative') {
      summary += `- Consider the Conservative mode to better manage your essential expenses\n`;
    }

    summary += `\n### 🎯 Recommendations\n`;
    if (savingsPercent < 20 && mode !== 'aggressive') {
      summary += `- Try **Aggressive Saving** mode to boost your savings rate\n`;
    }
    summary += `- Review your subscriptions and dining expenses for potential savings\n`;
    summary += `- Build an emergency fund covering 3-6 months of expenses\n`;
  }

  return summary;
};

// Generate financial insights from transactions
const generateInsights = (transactions, previousMonthTransactions) => {
  const insights = [];

  if (!transactions || transactions.length === 0) {
    insights.push({
      type: 'tip',
      message: 'Start tracking your expenses to get personalized financial insights!',
      icon: '💡',
    });
    return insights;
  }

  // Total spending this month
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Previous month comparison
  if (previousMonthTransactions && previousMonthTransactions.length > 0) {
    const prevTotalSpent = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (prevTotalSpent > 0) {
      const change = ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100;
      if (Math.abs(change) > 10) {
        insights.push({
          type: change > 0 ? 'warning' : 'success',
          message: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(change))}% compared to last month.`,
          icon: change > 0 ? '⚠️' : '✅',
        });
      }
    }
  }

  // Category-specific insights
  const categorySpending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  // Previous month category comparison
  if (previousMonthTransactions) {
    const prevCategorySpending = {};
    previousMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
      prevCategorySpending[t.category] = (prevCategorySpending[t.category] || 0) + t.amount;
    });

    for (const [category, amount] of Object.entries(categorySpending)) {
      const prevAmount = prevCategorySpending[category] || 0;
      if (prevAmount > 0) {
        const change = ((amount - prevAmount) / prevAmount) * 100;
        if (change > 20) {
          insights.push({
            type: 'warning',
            message: `You spent ${Math.round(change)}% more on ${category} this month. Consider reviewing these expenses.`,
            icon: '📈',
          });
        } else if (change < -20) {
          insights.push({
            type: 'success',
            message: `Great job! You reduced ${category} spending by ${Math.abs(Math.round(change))}% compared to last month.`,
            icon: '🎉',
          });
        }
      }
    }
  }

  // Top spending category
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const percentOfTotal = (topCategory[1] / totalSpent) * 100;
    if (percentOfTotal > 40) {
      insights.push({
        type: 'warning',
        message: `${topCategory[0]} accounts for ${Math.round(percentOfTotal)}% of your total spending. Consider diversifying your expenses.`,
        icon: '🎯',
      });
    }
  }

  // Savings rate insight
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100;
    if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        message: `Your savings rate is only ${Math.round(savingsRate)}%. Try to save at least 20% of your income.`,
        icon: '🏦',
      });
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        message: `Excellent! You're saving ${Math.round(savingsRate)}% of your income. Keep it up!`,
        icon: '🌟',
      });
    }
  }

  // Suggested savings
  const diningSpending = categorySpending['Food & Dining'] || 0;
  if (diningSpending > 3000) {
    const potentialSaving = Math.round(diningSpending * 0.3);
    insights.push({
      type: 'tip',
      message: `You could save approximately ₹${potentialSaving.toLocaleString('en-IN')} by reducing dining out expenses by 30%.`,
      icon: '🍽️',
    });
  }

  // Budget exceed warnings
  const shoppingSpending = categorySpending['Shopping'] || 0;
  if (shoppingSpending > 5000) {
    insights.push({
      type: 'warning',
      message: `Your shopping expenses are ₹${shoppingSpending.toLocaleString('en-IN')}. Consider if all purchases were necessary.`,
      icon: '🛍️',
    });
  }

  // Positive reinforcement
  if (totalIncome > totalSpent) {
    insights.push({
      type: 'success',
      message: `You're spending within your means! You have ₹${(totalIncome - totalSpent).toLocaleString('en-IN')} remaining this month.`,
      icon: '💪',
    });
  } else {
    insights.push({
      type: 'danger',
      message: `Your expenses (₹${totalSpent.toLocaleString('en-IN')}) exceed your income (₹${totalIncome.toLocaleString('en-IN')}). Consider reducing discretionary spending.`,
      icon: '🚨',
    });
  }

  return insights;
};

// Generate AI chat response
const generateChatResponse = (message, context = {}) => {
  const lowerMessage = message.toLowerCase();
  
  // Budget request
  if (lowerMessage.includes('budget') || lowerMessage.includes('plan')) {
    const data = extractFinancialData(message);
    if (data.income > 0) {
      return generateBudget(data, context.mode || 'balanced').summary;
    }
    return "To create a budget plan, please tell me your monthly income and expenses. For example: 'I earn ₹50,000 and my rent is ₹12,000'";
  }

  // Savings advice
  if (lowerMessage.includes('save more') || lowerMessage.includes('how to save') || lowerMessage.includes('saving')) {
    return `Here are some tips to save more:
    
1. **Track every expense** - Use the app to log all spending
2. **50/30/20 Rule** - Allocate 50% needs, 30% wants, 20% savings
3. **Reduce dining out** - Cook at home more often
4. **Cancel unused subscriptions** - Review monthly subscriptions
5. **Use public transport** - Save on fuel and parking
6. **Shop with a list** - Avoid impulse purchases
7. **Automate savings** - Set up automatic transfers

Try our AI Budget Planner to get a personalized savings plan!`;
  }

  // Overspending
  if (lowerMessage.includes('overspend') || lowerMessage.includes('overspending')) {
    return `To identify overspending:
    
1. Check your **category-wise spending** on the dashboard
2. Compare with **last month's expenses**
3. Look for **unnecessary subscriptions**
4. Review **impulse purchases**
5. Set **category budgets** to stay on track

I can help analyze your expenses if you share your recent transactions.`;
  }

  // Can I afford
  if (lowerMessage.includes('can i afford') || lowerMessage.includes('should i buy')) {
    return `Whether you can afford something depends on:
    
1. **Current savings** - Do you have enough saved?
2. **Monthly income** - Can you pay without stress?
3. **Essential expenses** - Are all bills covered?
4. **Emergency fund** - Do you have 3-6 months saved?
5. **Future goals** - Will this impact your goals?

A good rule: if you can't pay cash without dipping into savings, consider waiting.`;
  }

  // Investment advice
  if (lowerMessage.includes('invest') || lowerMessage.includes('should i invest')) {
    return `Investment suggestions based on your profile:

1. **Emergency Fund** - Save 3-6 months expenses first
2. **Index Funds** - Low cost, diversified option
3. **Fixed Deposits** - Safe but lower returns
4. **Mutual Funds** - Good for long-term growth
5. **PPF/NPS** - Tax-saving options

Start with 20% of your income and increase gradually. Consider consulting a financial advisor for personalized advice.`;
  }

  // Analyze expenses
  if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
    return `I can analyze your spending patterns. Here's what I look at:
    
1. **Monthly trends** - Are expenses increasing?
2. **Category breakdown** - Where does money go?
3. **Budget compliance** - Staying within limits?
4. **Savings rate** - Are you saving enough?
5. **Unusual spending** - Any anomalies?

Check your **Dashboard** for visual analysis or the **Reports** section for detailed breakdowns.`;
  }

  // General financial advice
  if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('suggestion')) {
    return `Here's personalized financial advice:

### 📋 Quick Tips
- **Emergency Fund**: Save 3-6 months of expenses
- **Debt Management**: Pay high-interest debt first
- **Invest Early**: Start investing as early as possible
- **Budget Review**: Review your budget monthly
- **Track Everything**: Log all expenses in the app

### 🎯 Recommended Actions
1. Set up **monthly budgets** for each category
2. Create **savings goals** with deadlines
3. Enable **notifications** for bill reminders
4. Check **weekly reports** to stay on track
5. Use the **AI Budget Planner** for optimization

What specific aspect would you like help with?`;
  }

  // Default helpful response
  return `I'm your Finance AI assistant! Here's what I can help with:

### 🤖 Available Commands
1. **Generate Budget** - "Create a budget for ₹50,000 income"
2. **Analyze Spending** - "Analyze my expenses"
3. **Savings Tips** - "How can I save more?"
4. **Investment Advice** - "Should I invest?"
5. **Budget Planning** - "Suggest a monthly plan"
6. **Expense Review** - "Where am I overspending?"

Just type your question naturally and I'll help you out! 💰`;
};

module.exports = {
  extractFinancialData,
  generateBudget,
  generateInsights,
  generateChatResponse,
};

