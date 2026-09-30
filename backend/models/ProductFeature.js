const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductFeature = sequelize.define('ProductFeature', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feature_key: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  feature_value: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  structured_specs: {
    type: DataTypes.JSON,
    allowNull: true
  },
  keywords: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'product_features',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProductFeature;
