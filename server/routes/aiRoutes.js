const express = require('express');
const router = express.Router();
const {
  budgetPlanner,
  getInsights,
  chat,
  getConversations,
  getConversation,
  deleteConversation,
} = require('../controllers/aiController');

const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/budget-planner', aiLimiter, budgetPlanner);
router.post('/insights', aiLimiter, getInsights);
router.post('/chat', aiLimiter, chat);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

module.exports = router;

