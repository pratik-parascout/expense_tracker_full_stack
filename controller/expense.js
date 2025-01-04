// controllers/ExpenseController.js
const path = require('path');
const ExpenseService = require('../services/ExpenseServices');
const { validationResult } = require('express-validator');

exports.getDownloads = async (req, res) => {
  try {
    const userId = req.user.id;
    const downloads = await ExpenseService.getDownloads(userId); // Get the downloads using service
    res.status(200).json({ downloads });
  } catch (err) {
    console.error('Error fetching downloads:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch downloaded files.',
    });
  }
};

exports.getDownload = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    const stringifiedExpense = JSON.stringify(expenses);
    const userId = req.user.id;
    const fileName = `Expense${userId}/${new Date().toISOString()}.txt`;

    // Upload the file to S3 and get the URL
    const fileURL = await ExpenseService.uploadToS3(
      stringifiedExpense,
      fileName
    );

    // Create a record of the download
    await ExpenseService.createDownloadRecord(fileName, fileURL, req.user.id);

    res.status(200).json({ fileURL, success: true });
  } catch (err) {
    console.error('Error in getDownload:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the request.',
    });
  }
};

exports.getHome = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/expense.html'));
};

exports.postExpense = async (req, res) => {
  const { amount, description, category } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const expense = await ExpenseService.createExpense(
      amount,
      description,
      category,
      req.user.id
    );
    res.status(201).json({ msg: 'Expense added successfully!', expense });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseService.getExpenses(req.user.id);
    res.status(200).json({ expenses });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res
      .status(500)
      .json({ msg: 'Failed to fetch expenses. Please try again.' });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    await ExpenseService.deleteExpense(id, req.user.id);
    res.status(200).json({ msg: 'Expense deleted successfully.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = await ExpenseService.createOrder();
    res.status(200).json({ order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create premium order' });
  }
};

exports.paymentStatus = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  try {
    await ExpenseService.verifyPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      req.user.id
    );
    res
      .status(200)
      .json({ msg: 'Payment verified and user upgraded to premium.' });
  } catch (error) {
    console.error('Error verifying payment status:', error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
};

exports.getUserDetails = (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      userId: user.id,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaders = await ExpenseService.getLeaderboard();
    res.status(200).json({ leaders });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
