const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const sequelize = require('../utils/database');
const jwtkey = process.env.JWT_KEY;

function generateToken(id, name) {
  return jwt.sign({ userId: id, name: name }, jwtkey);
}

const loginUser = async (email, password) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({ where: { email } }, { transaction: t });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('User not authorized');
    }

    await t.commit();
    return {
      msg: 'Login successful',
      token: generateToken(user.id, user.username),
    };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = {
  loginUser,
};
