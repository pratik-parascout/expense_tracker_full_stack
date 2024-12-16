const express = require('express');

const expenseController = require('../controller/expense');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

// Route to add a new expense
router.post(
  '/add-expense',
  userAuthentication.authenticate,
  expenseController.postExpense
);

// Route to get all expenses
router.get(
  '/expenses',
  userAuthentication.authenticate,
  expenseController.getExpenses
);

// Route to delete an expense by ID
router.delete(
  '/expenses/:id',
  userAuthentication.authenticate,
  expenseController.deleteExpense
);

// Serve the expense page
router.get('/', expenseController.getHome);

module.exports = router;
