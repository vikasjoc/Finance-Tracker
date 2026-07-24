const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  exportTransactionsCSV,
} = require('../controllers/transactionController');

const { protect } = require('../middleware/auth');
const { transactionValidation, validate } = require('../middleware/validation');

router.use(protect);

router.get('/stats', getTransactionStats);
router.get('/export/csv', exportTransactionsCSV);

router.route('/')
  .get(getTransactions)
  .post(transactionValidation, validate, createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;

