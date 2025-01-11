const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const sendResetEmail = require('../utils/resetmail');
const sequelize = require('../utils/database');
const User = require('../model/User');
const ForgotPasswordRequest = require('../model/ForgetPasswordRequest'); // Correct model

const createPasswordResetRequest = async (email) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({ where: { email } }, { transaction: t });
    if (!user) {
      throw new Error('User not found');
    }

    const resetId = uuidv4();
    await ForgotPasswordRequest.create(
      {
        id: resetId,
        userId: user.id,
        isActive: true,
      },
      { transaction: t }
    );

    const resetLink = `http://13.203.1.119:3000/password/resetpassword/${resetId}`;
    await sendResetEmail.sendResetEmail(email, resetId);

    await t.commit();
    return resetLink;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const verifyResetRequest = async (id) => {
  const request = await ForgotPasswordRequest.findOne({
    where: { id, isActive: true },
  });

  if (!request) {
    throw new Error('Invalid or expired reset link.');
  }
  return request;
};

const resetPassword = async (id, password) => {
  const request = await verifyResetRequest(id);

  const user = await User.findByPk(request.userId);
  if (!user) {
    throw new Error('User not found.');
  }

  user.password = bcrypt.hashSync(password, 10);
  await user.save();

  request.isActive = false;
  await request.save();
};

module.exports = {
  createPasswordResetRequest,
  verifyResetRequest,
  resetPassword,
};
