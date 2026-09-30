const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesDaily = sequelize.define('SalesDaily', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  total_sales: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_orders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'sales_daily',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SalesDaily;
