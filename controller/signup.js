const path = require('path');
const User = require('../model/signup');

exports.getSignup = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
};

exports.postSignup = (req, res) => {
  const { username, email, password } = req.body;

  User.findOne({ where: { email } })
    .then((existingUser) => {
      if (existingUser) {
        res.status(400).json({ msg: 'User already exists' });
        return null;
      }
      return User.create({
        username,
        email,
        password,
      });
    })
    .then((newUser) => {
      if (newUser) {
        console.log('User Created:', newUser);
        res.redirect('/');
      }
    })
    .catch((err) => {
      console.error('Error during signup:', err);
      res
        .status(500)
        .json({ msg: 'An error occurred during signup. Please try again.' });
    });
};
