const path = require('path');

const User = require('../model/signup');

exports.getSignup = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
};

exports.postSignup = (req, res) => {
  const { username, email, password } = req.body;

  User.create({
    username: username,
    email: email,
    password: password,
  })
    .then((user) => {
      console.log('User Created: ', user);
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
};
