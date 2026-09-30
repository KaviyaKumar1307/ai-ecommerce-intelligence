const { Cart, CartItem, Product, Category, UserEvent } = require('../models');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let [cart] = await Cart.findOrCreate({
      where: { user_id: userId }
    });

    const items = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: Product,
          as: 'product',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    let subtotal = 0;
    let totalItems = 0;

    items.forEach(item => {
      const price = parseFloat(item.product ? item.product.price : 0);
      subtotal += price * item.quantity;
      totalItems += item.quantity;
    });

    return res.status(200).json({
      success: true,
      data: {
        cart_id: cart.id,
        items,
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    let [cart] = await Cart.findOrCreate({ where: { user_id: userId } });

    let [cartItem, created] = await CartItem.findOrCreate({
      where: { cart_id: cart.id, product_id },
      defaults: { quantity: parseInt(quantity, 10) }
    });

    if (!created) {
      cartItem.quantity += parseInt(quantity, 10);
      await cartItem.save();
    }

    // Log ADD_TO_CART behavioral event for AI recommendation scoring
    UserEvent.create({
      user_id: userId,
      product_id: product.id,
      event_type: 'ADD_TO_CART',
      metadata: { quantity: parseInt(quantity, 10) }
    }).catch(err => console.error('[EventLogger] Failed to log cart addition:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Product added to cart successfully.',
      data: { cartItem }
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than or equal to 1.'
      });
    }

    const cartItem = await CartItem.findByPk(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    cartItem.quantity = parseInt(quantity, 10);
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: { cartItem }
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cartItem = await CartItem.findByPk(itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    const productId = cartItem.product_id;
    await cartItem.destroy();

    // Log REMOVE_FROM_CART event
    UserEvent.create({
      user_id: req.user.id,
      product_id: productId,
      event_type: 'REMOVE_FROM_CART',
      metadata: { timestamp: new Date().toISOString() }
    }).catch(err => console.error('[EventLogger] Failed to log cart removal:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ where: { user_id: userId } });

    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
