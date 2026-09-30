const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecommendationLog = sequelize.define('RecommendationLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  strategy: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  score: {
    type: DataTypes.DECIMAL(6, 4),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'recommendations',
  timestamps: false
});

module.exports = RecommendationLog;
