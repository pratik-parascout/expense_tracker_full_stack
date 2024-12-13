const express = require('express');

const expenseController = require('../controller/expense');

const router = express.Router();

// Route to add a new expense
router.post('/add-expense', expenseController.postExpense);

// Route to get all expenses
router.get('/expenses', expenseController.getExpenses);

// Route to delete an expense by ID
router.delete('/expenses/:id', expenseController.deleteExpense);

// Serve the expense page
router.get('/', expenseController.getHome);

module.exports = router;
