const path = require('path');

const bcrypt = require('bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

function generateToken(id, name) {
  return jwt.sign(
    { userId: id, name: name },
    '2d4f5d7t5rt54g8r7y5s7g68s78g56e7ys456f7t8r4yr4gs78r7trgs'
  );
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
    res
      .status(200)
      .json({
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
