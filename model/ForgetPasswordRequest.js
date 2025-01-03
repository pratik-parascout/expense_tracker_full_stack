const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

const ForgotPasswordRequest = sequelize.define('forgotPasswordRequest', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = ForgotPasswordRequest;
