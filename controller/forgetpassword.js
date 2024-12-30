const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const sendResetEmail = require('../utils/resetmail');
const sequelize = require('../utils/database');
const User = require('../model/User');
const ForgotPasswordRequest = require('../model/ForgetPasswordRequest'); // Correct the model name

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

    const resetId = uuidv4();

    await ForgotPasswordRequest.create(
      {
        id: resetId,
        userId: user.id,
        isActive: true,
      },
      { transaction: t }
    );

    const resetLink = `http://localhost:3000/password/resetpassword/${resetId}`;

    await sendResetEmail.sendResetEmail(email, resetId);

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

exports.getResetForm = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await ForgotPasswordRequest.findOne({
      where: { id, isActive: true },
    });

    if (!request) {
      return res.status(400).json({ msg: 'Invalid or expired reset link.' });
    }

    res.sendFile(path.join(__dirname, '../public/html/resetpassword.html'));
  } catch (error) {
    console.error('Error getting reset form:', error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ msg: 'ID and new password are required.' });
  }

  try {
    const request = await ForgotPasswordRequest.findOne({
      where: { id, isActive: true },
    });

    if (!request) {
      return res.status(404).json({ msg: 'Invalid or expired reset link.' });
    }

    const user = await User.findByPk(request.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    request.isActive = false;
    await request.save();

    res.status(200).json({ msg: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ msg: 'Failed to reset password.' });
  }
};
