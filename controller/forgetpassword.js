const path = require('path');
const sendResetEmail = require('../utils/resetmail');
const sequelize = require('../utils/database');
const User = require('../model/User');

exports.getForm = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/forgetpassword.html'));
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required.' });
  }

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({ where: { email } }, { transaction: t });

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }
    await sendResetEmail.sendResetEmail(email);

    await t.commit();

    res.status(200).json({
      msg: 'Password reset link sent. Please check your email.',
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in forgot password:', error);
    res.status(500).json({
      msg: 'Failed to process request. Please try again.',
    });
  }
};
