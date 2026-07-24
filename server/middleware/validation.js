const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Transaction validation rules
const transactionValidation = [
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('paymentMethod')
    .optional()
    .isIn([
      'Cash',
      'Bank Transfer',
      'Credit Card',
      'Debit Card',
      'UPI',
      'Net Banking',
      'Cheque',
      'Wallet',
      'Other',
    ])
    .withMessage('Invalid payment method'),
  body('description').optional().trim().isLength({ max: 200 }),
];

// Budget validation
const budgetValidation = [
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2024 })
    .withMessage('Year must be 2024 or later'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('plannedAmount')
    .notEmpty()
    .withMessage('Planned amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
];

// Category validation
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  transactionValidation,
  budgetValidation,
  categoryValidation,
};

