const path = require('path');
const sendResetEmail = require('../utils/resetmail');

exports.getForm = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/forgetpassword.html'));
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required.' });
  }

  try {
    await sendResetEmail.sendResetEmail(email);

    res
      .status(200)
      .json({ msg: 'Password reset link sent. Please check your email.' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res
      .status(500)
      .json({ msg: 'Failed to process request. Please try again.' });
  }
};
