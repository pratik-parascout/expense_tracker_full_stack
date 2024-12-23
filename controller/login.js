const path = require('path');

const bcrypt = require('bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const jwtkey = process.env.JWT_KEY;

function generateToken(id, name) {
  return jwt.sign({ userId: id, name: name }, jwtkey);
}

exports.getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/login.html'));
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    console.log('User Login successful');
    res.status(200).json({
      msg: 'Login successful',
      token: generateToken(user.id, user.username),
    });
  } catch (err) {
    console.error('Error during login:', err);
    res
      .status(500)
      .json({ msg: 'An error occurred during login. Please try again.' });
  }
};
