const path = require('path');

const bcrypt = require('bcrypt');
const User = require('../model/User');

exports.getSignup = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
};

exports.postSignup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log('User Created:', newUser);
    res.redirect('/signup');
  } catch (err) {
    console.error('Error during signup:', err);
    res
      .status(500)
      .json({ msg: 'An error occurred during signup. Please try again.' });
  }
};
