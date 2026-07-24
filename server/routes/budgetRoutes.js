const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  setMonthlyBudget,
  getBudgetSummary,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/auth');
const { budgetValidation, validate } = require('../middleware/validation');

router.use(protect);

router.get('/summary', getBudgetSummary);
router.post('/monthly', setMonthlyBudget);

router.route('/')
  .get(getBudgets)
  .post(budgetValidation, validate, createBudget);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;

