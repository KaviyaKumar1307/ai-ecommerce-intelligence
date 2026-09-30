const { User, Product, Order, OrderItem, Category, UserEvent, SearchLog, RecommendationLog, SalesDaily, sequelize } = require('../models');
const aiService = require('../services/aiService');

const getDashboardKPIs = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    // Total revenue & AOV
    const orders = await Order.findAll({
      attributes: ['total_amount', 'status']
    });

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top selling products by order frequency
    const orderItems = await OrderItem.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image_url'] }
      ]
    });

    const productSalesMap = {};
    orderItems.forEach(item => {
      const pid = item.product_id;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = {
          product: item.product,
          unitsSold: 0,
          totalRevenue: 0
        };
      }
      productSalesMap[pid].unitsSold += item.quantity;
      productSalesMap[pid].totalRevenue += item.quantity * parseFloat(item.price);
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Category distribution
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'] }]
    });

    const categoryDistribution = categories.map(c => ({
      name: c.name,
      count: c.products ? c.products.length : 0
    }));

    // Recent orders
    const recentOrders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['name'] }] }
      ],
      order: [['created_at', 'DESC']],
      limit: 6
    });

    // Recent search queries
    const recentSearches = await SearchLog.findAll({
      order: [['timestamp', 'DESC']],
      limit: 8
    });

    // Recent daily sales (last 14 days)
    const recentDailySales = await SalesDaily.findAll({
      order: [['date', 'DESC']],
      limit: 14
    });

    // AI Health
    const aiHealth = await aiService.checkHealth();

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2))
        },
        topSellingProducts,
        categoryDistribution,
        recentOrders,
        recentSearches,
        recentDailySales: recentDailySales.reverse(),
        systemHealth: {
          database: {
            connected: true,
            dialect: sequelize.getDialect()
          },
          backend: {
            status: 'HEALTHY',
            uptime_seconds: process.uptime()
          },
          aiService: {
            online: aiHealth.online,
            details: aiHealth.data || aiHealth.error
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order #${id} status updated to ${status}.`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Order, as: 'orders', attributes: ['id', 'total_amount'] }]
    });

    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      orderCount: u.orders ? u.orders.length : 0,
      totalSpent: u.orders ? u.orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) : 0,
      created_at: u.created_at
    }));

    return res.status(200).json({
      success: true,
      data: { users: formatted }
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

const getSalesHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '90', 10);
    const salesHistory = await SalesDaily.findAll({
      order: [['date', 'ASC']],
      limit
    });

    return res.status(200).json({
      success: true,
      data: salesHistory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardKPIs,
  updateOrderStatus,
  getAllUsers,
  getAllOrders,
  getSalesHistory
};
