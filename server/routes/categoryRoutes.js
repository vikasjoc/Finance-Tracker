const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect } = require('../middleware/auth');
const { categoryValidation, validate } = require('../middleware/validation');

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(categoryValidation, validate, createCategory);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;

