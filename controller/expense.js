const path = require('path');
const Expense = require('../model/Expense');

// Serve the Expense Page (HTML file) and fetch all expenses
exports.getHome = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/expense.html'));
};

// Add a New Expense
exports.postExpense = (req, res) => {
  const { amount, description, category } = req.body;

  // Validate data
  if (!amount || !description || !category) {
    return res.status(400).json({ msg: 'All fields are required.' });
  }

  Expense.create({
    amount,
    description,
    category,
  })
    .then((result) => {
      res
        .status(201)
        .json({ msg: 'Expense added successfully!', expense: result });
    })
    .catch((err) => {
      console.error('Error creating expense:', err);
      res.status(500).json({ msg: 'Failed to add expense. Please try again.' });
    });
};

exports.getExpenses = (req, res) => {
  Expense.findAll()
    .then((expenses) => {
      res.status(200).json({ expenses });
    })
    .catch((err) => {
      console.error('Error fetching expenses:', err);
      res
        .status(500)
        .json({ msg: 'Failed to fetch expenses. Please try again.' });
    });
};

exports.deleteExpense = (req, res) => {
  const { id } = req.params;

  Expense.destroy({
    where: { id },
  })
    .then((rowsDeleted) => {
      if (rowsDeleted === 0) {
        return res.status(404).json({ msg: 'Expense not found.' });
      }
      res.status(200).json({ msg: 'Expense deleted successfully.' });
    })
    .catch((err) => {
      console.error('Error deleting expense:', err);
      res
        .status(500)
        .json({ msg: 'Failed to delete expense. Please try again.' });
    });
};
