const { Op } = require('sequelize');
const { Product, Category, ProductFeature, SearchLog } = require('../models');

const searchKeyword = async (req, res, next) => {
  try {
    const { q, limit = 12 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.'
      });
    }

    const queryStr = q.trim();
    const userId = req.user ? req.user.id : null;

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${queryStr}%` } },
          { description: { [Op.like]: `%${queryStr}%` } },
          { brand: { [Op.like]: `%${queryStr}%` } }
        ]
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductFeature, as: 'features', attributes: ['feature_key', 'feature_value'] }
      ],
      limit: parseInt(limit, 10)
    });

    // Log search event
    SearchLog.create({
      user_id: userId,
      query: queryStr,
      results_count: products.length,
      search_type: 'KEYWORD'
    }).catch(err => console.error('[SearchLogger] Error logging keyword search:', err.message));

    return res.status(200).json({
      success: true,
      data: {
        query: queryStr,
        results_count: products.length,
        search_type: 'KEYWORD',
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchKeyword
};
