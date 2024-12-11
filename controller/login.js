const path = require('path');
const User = require('../model/User');

exports.getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/login.html'));
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ msg: 'User Not Found' });
      }

      if (user.password === password) {
        return res.status(200).json({ msg: 'Login Successful.' });
      } else {
        return res.status(401).json({ msg: 'Incorrect Password' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ msg: 'Internal Server Error' });
    });
};
