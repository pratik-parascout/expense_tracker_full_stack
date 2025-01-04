const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const DownloadList = sequelize.define('DownloadList', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileURL: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = DownloadList;
