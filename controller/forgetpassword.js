const path = require('path');
const ForgotPasswordService = require('../services/ForgetPasswordServices');

exports.getForm = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/forgetpassword.html'));
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required.' });
  }

  try {
    const resetLink = await ForgotPasswordService.createPasswordResetRequest(
      email
    );
    res.status(200).json({
      msg: 'Password reset link sent. Please check your email.',
      resetLink,
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      msg: 'Failed to process request. Please try again.',
    });
  }
};

exports.getResetForm = async (req, res) => {
  const { id } = req.params;

  try {
    await ForgotPasswordService.verifyResetRequest(id);
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
    await ForgotPasswordService.resetPassword(id, password);
    res.status(200).json({ msg: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ msg: 'Failed to reset password.' });
  }
};
