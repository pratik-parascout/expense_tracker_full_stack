const Expense = require('../model/Expense');
const User = require('../model/User');
const DownloadList = require('../model/FileDownloaded');
const sequelize = require('../utils/database');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const razorpay = require('razorpay');

const razorpay_key = process.env.RAZORPAY_KEY_ID;
const razorpay_secret = process.env.RAZORPAY_KEY_SECRET;
const bucket_name = process.env.BUCKET_NAME;
const aws_access_key = process.env.AWS_ACCESS_KEY;
const aws_access_key_secret = process.env.AWS_ACCESS_KEY_SECRET;

const instance = new razorpay({
  key_id: razorpay_key,
  key_secret: razorpay_secret,
});

const uploadToS3 = (data, filename) => {
  const s3bucket = new AWS.S3({
    accessKeyId: aws_access_key,
    secretAccessKey: aws_access_key_secret,
  });

  const params = {
    Bucket: bucket_name,
    Key: filename,
    Body: data,
    ACL: 'public-read',
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.Location);
      }
    });
  });
};

const getDownloads = (userId) => {
  return DownloadList.findAll({ where: { userId } });
};

// const createDownloadRecord = async (fileName, fileURL, userId) => {
//   return await DownloadList.create({ fileName, fileURL, userId });
// };

const getExpenses = (userId) => {
  return Expense.findAll({ where: { userId } });
};

const createExpense = async (amount, description, category, userId) => {
  const t = await sequelize.transaction();

  try {
    const expense = await Expense.create(
      { amount, description, category, userId },
      { transaction: t }
    );

    const user = await User.findByPk(userId, { transaction: t });
    user.totalExpense += parseFloat(amount);
    await user.save({ transaction: t });

    await t.commit();
    return expense;
  } catch (err) {
    await t.rollback();
    throw new Error('Failed to add expense');
  }
};

const deleteExpense = async (expenseId, userId) => {
  const t = await sequelize.transaction();

  try {
    const expense = await Expense.findOne({
      where: { id: expenseId, userId },
      transaction: t,
    });

    if (!expense) throw new Error('Expense not found');

    const user = await User.findByPk(userId, { transaction: t });
    user.totalExpense -= parseFloat(expense.amount);
    await user.save({ transaction: t });

    await expense.destroy({ transaction: t });

    await t.commit();
    return expense;
  } catch (err) {
    await t.rollback();
    throw new Error('Failed to delete expense');
  }
};

const createDownloadRecord = async (fileName, fileURL, userId) => {
  return await DownloadList.create({ fileName, fileURL, userId });
};

const createOrder = async () => {
  const amount = 500 * 100; // Example amount, convert to paise
  const options = {
    amount,
    currency: 'INR',
    receipt: `premium-order-${Date.now()}`,
    payment_capture: 1,
  };

  return await instance.orders.create(options);
};

const verifyPayment = async (
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  userId
) => {
  const hmac = crypto.createHmac('sha256', razorpay_secret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== razorpay_signature) {
    throw new Error('Payment verification failed');
  }

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  user.isPremium = true;
  await user.save();
  return user;
};

const getLeaderboard = async () => {
  return await User.findAll({
    attributes: ['username', 'totalExpense'],
    order: [['totalExpense', 'DESC']],
  });
};

module.exports = {
  uploadToS3,
  getDownloads,
  getExpenses,
  createExpense,
  deleteExpense,
  createDownloadRecord,
  createOrder,
  verifyPayment,
  getLeaderboard,
};
