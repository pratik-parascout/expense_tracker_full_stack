const path = require('path');
const AuthService = require('../services/LoginServices');

exports.getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/login.html'));
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await AuthService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({
      msg: 'An error occurred during login. Please try again.',
    });
  }
};
