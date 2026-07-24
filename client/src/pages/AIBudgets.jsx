import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getBudgetPlan, sendChatMessage, clearChat, addMessage } from '../redux/slices/aiSlice';
import { HiOutlineSparkles, HiOutlineChat, HiOutlinePaperAirplane, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineTrash } from 'react-icons/hi';

const budgetModes = [
  { id: 'conservative', label: 'Conservative', icon: HiOutlineShieldCheck, desc: 'Focus on needs & safety', color: 'blue' },
  { id: 'balanced', label: 'Balanced', icon: HiOutlineChartBar, desc: 'Equal needs & savings', color: 'green' },
  { id: 'aggressive', label: 'Aggressive Saving', icon: HiOutlineLightningBolt, desc: 'Maximum savings', color: 'purple' },
];

const suggestionPrompts = [
  'I earn ₹40,000 and my rent is ₹12,000',
  'My monthly income is ₹60,000',
  'Create a budget for me',
  'How can I save more money?',
];

const AIBudgets = () => {
  const dispatch = useDispatch();
  const { budgetPlan, messages, loading, error } = useSelector((state) => state.ai);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('balanced');
  const [showPlanner, setShowPlanner] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, budgetPlan]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    dispatch(addMessage({ role: 'user', content: userMessage, timestamp: new Date().toISOString() }));

    const result = await dispatch(sendChatMessage({ message: userMessage }));
    if (result.meta.requestStatus === 'rejected') {
      toast.error(result.payload || 'Failed to get response');
    }
  };

  const handleBudgetPlan = async (prompt) => {
    setInput(prompt);
    dispatch(addMessage({ role: 'user', content: prompt, timestamp: new Date().toISOString() }));
    const result = await dispatch(getBudgetPlan({ message: prompt, mode }));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowPlanner(true);
    } else {
      toast.error(result.payload || 'Failed to generate budget');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatBudgetResponse = (plan) => {
    if (!plan) return '';
    return `
📊 Budget Plan Summary

Monthly Income: ₹${plan.monthlyIncome.toLocaleString('en-IN')}
Mode: ${plan.mode.charAt(0).toUpperCase() + plan.mode.slice(1)}
Savings Rate: ${plan.savingsRate}%

💰 BUDGET BREAKDOWN
${plan.breakdown?.map(item => `${item.category}: ₹${item.amount.toLocaleString('en-IN')} (${item.type})`).join('\n')}

Remaining: ₹${plan.remaining.toLocaleString('en-IN')}
    `.trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <HiOutlineSparkles className="w-7 h-7 text-primary-600" />
          Finance AI 🤖
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          AI-powered budget planning and financial insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Modes & Suggestion */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Budget Mode</h3>
            <div className="space-y-3">
              {budgetModes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    mode === m.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-100 dark:border-dark-700 hover:border-gray-200 dark:hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      mode === m.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Suggestions</h3>
            <div className="space-y-2">
              {suggestionPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleBudgetPlan(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors text-sm text-gray-600 dark:text-gray-400"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {budgetPlan && (
            <button
              onClick={() => { dispatch(clearChat()); setShowPlanner(false); }}
              className="btn-ghost w-full flex items-center justify-center gap-2 text-red-500"
            >
              <HiOutlineTrash className="w-4 h-4" /> Clear Chat
            </button>
          )}
        </div>

        {/* Chat & Budget Results */}
        <div className="lg:col-span-2 space-y-4">
          {budgetPlan && showPlanner ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineChartBar className="w-6 h-6 text-primary-600" />
                Your {budgetPlan.mode.charAt(0).toUpperCase() + budgetPlan.mode.slice(1)} Budget Plan
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Monthly Income</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{budgetPlan.monthlyIncome.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Allocated</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{budgetPlan.totalAllocated.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Remaining</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{budgetPlan.remaining.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Savings Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{budgetPlan.savingsRate}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Budget Breakdown</h3>
                {budgetPlan.breakdown?.map((item, i) => {
                  const percent = budgetPlan.monthlyIncome > 0 ? (item.amount / budgetPlan.monthlyIncome * 100) : 0;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            item.type === 'Needs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            item.type === 'Wants' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            item.type === 'Savings' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{item.type}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="progress-bar mb-2">
                        <div className="progress-fill bg-primary-500" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.reason}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* AI Summary */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <HiOutlineSparkles className="w-5 h-5 text-primary-600" />
                  AI Analysis
                </h3>
                <div className="prose prose-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {budgetPlan.summary}
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* Chat Interface */}
          <div className="card flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100 dark:border-dark-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineChat className="w-5 h-5 text-primary-600" />
                AI Financial Assistant
              </h3>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="font-medium text-gray-600 dark:text-gray-300 mb-2">Ask me anything about your finances!</p>
                  <p className="text-sm">Try: "Create a budget for ₹50,000" or "How can I save more?"</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`chat-message ${msg.role}`}>
                      {msg.role === 'assistant' && <span className="text-lg mr-2">🤖</span>}
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="chat-message assistant">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600"></div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-dark-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your finances..."
                  className="input-field flex-1"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="btn-primary px-4"
                >
                  <HiOutlinePaperAirplane className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBudgets;
