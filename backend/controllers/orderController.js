const { Order, OrderItem, Cart, CartItem, Product, UserEvent, SalesDaily, sequelize } = require('../models');

const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { shipping_address, payment_method = 'CARD', items: directItems } = req.body;

    let itemsToProcess = [];

    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      // Direct checkout
      itemsToProcess = directItems;
    } else {
      // Checkout from cart
      const cart = await Cart.findOne({ where: { user_id: userId }, transaction });
      if (!cart) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Cart not found.' });
      }

      const cartItems = await CartItem.findAll({
        where: { cart_id: cart.id },
        include: [{ model: Product, as: 'product' }],
        transaction
      });

      if (cartItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Your cart is empty.' });
      }

      itemsToProcess = cartItems.map(ci => ({
        product_id: ci.product_id,
        quantity: ci.quantity,
        product: ci.product
      }));
    }

    let calculatedTotal = 0;
    let totalUnits = 0;
    const verifiedOrderItems = [];

    for (const item of itemsToProcess) {
      const product = item.product || await Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: `Product ID ${item.product_id} not found.` });
      }

      if (product.stock_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock_quantity}, requested: ${item.quantity}.`
        });
      }

      // Deduct inventory
      product.stock_quantity -= item.quantity;
      await product.save({ transaction });

      const price = parseFloat(product.price);
      calculatedTotal += price * item.quantity;
      totalUnits += item.quantity;

      verifiedOrderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price
      });
    }

    // Create Order
    const order = await Order.create({
      user_id: userId,
      total_amount: parseFloat(calculatedTotal.toFixed(2)),
      status: 'PROCESSING',
      shipping_address: shipping_address || 'Default User Address',
      payment_method,
      payment_status: 'PAID'
    }, { transaction });

    // Create Order Items
    for (const oi of verifiedOrderItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: oi.product_id,
        quantity: oi.quantity,
        price: oi.price
      }, { transaction });

      // Log PURCHASE event
      await UserEvent.create({
        user_id: userId,
        product_id: oi.product_id,
        event_type: 'PURCHASE',
        metadata: { order_id: order.id, price: oi.price, quantity: oi.quantity }
      }, { transaction });
    }

    // Clear cart if ordered from cart
    if (!directItems) {
      const cart = await Cart.findOne({ where: { user_id: userId }, transaction });
      if (cart) {
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction });
      }
    }

    // Update sales_daily aggregate for current date
    const todayStr = new Date().toISOString().split('T')[0];
    let [dailyRecord] = await SalesDaily.findOrCreate({
      where: { date: todayStr },
      defaults: { total_sales: 0, total_orders: 0, total_units: 0 },
      transaction
    });

    dailyRecord.total_sales = parseFloat(dailyRecord.total_sales) + calculatedTotal;
    dailyRecord.total_orders += 1;
    dailyRecord.total_units += totalUnits;
    await dailyRecord.save({ transaction });

    await transaction.commit();

    const finalizedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: { order: finalizedOrder }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
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

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const whereClause = { id };
    if (!isAdmin) {
      whereClause.user_id = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
