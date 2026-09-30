const { Op } = require('sequelize');
const { Product, Category, ProductFeature, UserEvent } = require('../models');

const getProducts = async (req, res, next) => {
  try {
    const {
      category_id,
      brand,
      min_price,
      max_price,
      search,
      sort,
      featured,
      page = 1,
      limit = 12
    } = req.query;

    const whereClause = {};

    if (category_id) {
      whereClause.category_id = category_id;
    }

    if (brand) {
      whereClause.brand = brand;
    }

    if (featured === 'true') {
      whereClause.is_featured = true;
    }

    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [['id', 'ASC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'rating') order = [['rating', 'DESC']];
    else if (sort === 'newest') order = [['created_at', 'DESC']];

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductFeature, as: 'features', attributes: ['feature_key', 'feature_value'] }
      ],
      order,
      offset,
      limit: parsedLimit,
      distinct: true
    });

    return res.status(200).json({
      success: true,
      data: {
        total: count,
        page: parseInt(page, 10),
        totalPages: Math.ceil(count / parsedLimit),
        limit: parsedLimit,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductFeature, as: 'features' }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`
      });
    }

    // If user is authenticated, log a PRODUCT_VIEW event
    if (req.user && req.user.id) {
      UserEvent.create({
        user_id: req.user.id,
        product_id: product.id,
        event_type: 'PRODUCT_VIEW',
        metadata: { timestamp: new Date().toISOString() }
      }).catch(err => console.error('[EventLogger] Failed to log view:', err.message));
    }

    return res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'] }]
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image_url: cat.image_url,
      product_count: cat.products ? cat.products.length : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        categories: formatted
      }
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      category_id,
      price,
      original_price,
      stock_quantity,
      image_url,
      brand,
      is_featured,
      features
    } = req.body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      name,
      slug: generatedSlug,
      description,
      category_id,
      price,
      original_price,
      stock_quantity: stock_quantity || 0,
      image_url,
      brand,
      is_featured: !!is_featured
    });

    if (features && Array.isArray(features)) {
      const featureRows = features.map(f => ({
        product_id: product.id,
        feature_key: f.feature_key,
        feature_value: f.feature_value,
        structured_specs: f.structured_specs || null,
        keywords: f.keywords || `${name} ${f.feature_key} ${f.feature_value}`.toLowerCase()
      }));
      await ProductFeature.bulkCreate(featureRows);
    }

    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductFeature, as: 'features' }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: createdProduct }
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`
      });
    }

    await product.update(req.body);

    const updated = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductFeature, as: 'features' }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
