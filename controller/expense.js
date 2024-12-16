const path = require('path');
const Expense = require('../model/Expense');
const razorpay = require('razorpay');
const crypto = require('crypto');
const razorpay_key = process.env.RAZORPAY_KEY_ID;
const razorpay_secret = process.env.RAZORPAY_KEY_SECRET;
const User = require('../model/User');

const instance = new razorpay({
  key_id: razorpay_key,
  key_secret: razorpay_secret,
});

exports.getHome = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/expense.html'));
};

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
    userId: req.user.id,
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
  req.user
    .getExpenses()
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
    userId: req.user.id,
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

exports.createOrder = async (req, res) => {
  try {
    const amount = 500 * 100;

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `premium-order-${Date.now()}`,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);
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
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      const user = req.user;

      if (user) {
        user.isPremium = true;
        await user.save();

        res
          .status(200)
          .json({ msg: 'Payment verified and user upgraded to premium.' });
      } else {
        res.status(404).json({ msg: 'User not found.' });
      }
    } else {
      res.status(400).json({ msg: 'Payment verification failed.' });
    }
  } catch (error) {
    console.error('Error verifying payment status:', error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
};
