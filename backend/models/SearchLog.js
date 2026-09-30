const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SearchLog = sequelize.define('SearchLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  query: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  results_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  search_type: {
    type: DataTypes.ENUM('KEYWORD', 'SEMANTIC'),
    defaultValue: 'KEYWORD'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'searches',
  timestamps: false
});

module.exports = SearchLog;
