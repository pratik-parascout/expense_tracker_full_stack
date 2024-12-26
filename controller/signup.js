const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const sequelize = require('../utils/database');

exports.getSignup = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
};

exports.postSignup = async (req, res) => {
  const { username, email, password } = req.body;

  const t = await sequelize.transaction();

  try {
    const existingUser = await User.findOne(
      { where: { email } },
      { transaction: t }
    );
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ msg: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create(
      {
        username,
        email,
        password: hashedPassword,
      },
      { transaction: t }
    );

    await t.commit();
    console.log('User Created:', newUser);
    res.redirect('/signup');
  } catch (err) {
    await t.rollback();
    console.error('Error during signup:', err);
    res
      .status(500)
      .json({ msg: 'An error occurred during signup. Please try again.' });
  }
};
