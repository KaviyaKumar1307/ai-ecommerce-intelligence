const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductFeature = require('./ProductFeature');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const UserEvent = require('./UserEvent');
const SearchLog = require('./SearchLog');
const RecommendationLog = require('./RecommendationLog');
const SalesDaily = require('./SalesDaily');
const seedData = require('../config/seedData');

// ==========================================
// Define Model Associations
// ==========================================

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product <-> ProductFeature
Product.hasMany(ProductFeature, { foreignKey: 'product_id', as: 'features' });
ProductFeature.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User <-> Cart
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart <-> CartItem <-> Product
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cart_items' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order <-> OrderItem <-> Product
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User Events & Searches
User.hasMany(UserEvent, { foreignKey: 'user_id', as: 'events' });
UserEvent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Product.hasMany(UserEvent, { foreignKey: 'product_id', as: 'events' });
UserEvent.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(SearchLog, { foreignKey: 'user_id', as: 'searches' });
SearchLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Recommendations
User.hasMany(RecommendationLog, { foreignKey: 'user_id', as: 'recommendations' });
RecommendationLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Product.hasMany(RecommendationLog, { foreignKey: 'product_id', as: 'recommended_products' });
RecommendationLog.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ==========================================
// Database Initialization & Seeding Routine
// ==========================================
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connection successfully established (Dialect: ${sequelize.getDialect()}).`);

    // Sync database schema
    await sequelize.sync({ alter: true });
    console.log('[Database] Schema synchronized.');

    // Check if seeding is needed
    const countUsers = await User.count();
    if (countUsers === 0) {
      console.log('[Database] Empty database detected. Seeding realistic dataset...');

      // 1. Categories
      await Category.bulkCreate(seedData.categories);

      // 2. Users
      await User.bulkCreate(seedData.users);

      // 3. Products
      await Product.bulkCreate(seedData.products);

      // 4. Product Features
      await ProductFeature.bulkCreate(seedData.productFeatures);

      // 5. User Events
      await UserEvent.bulkCreate(seedData.userEvents);

      // 6. Orders and Order Items
      for (const orderInfo of seedData.sampleOrders) {
        const { items, ...orderData } = orderInfo;
        const createdOrder = await Order.create(orderData);
        if (items && items.length > 0) {
          const orderItems = items.map(item => ({
            ...item,
            order_id: createdOrder.id
          }));
          await OrderItem.bulkCreate(orderItems);
        }
      }

      // 7. Sample Searches
      await SearchLog.bulkCreate(seedData.sampleSearches);

      // 8. Daily Sales (182 days for time-series forecasting)
      await SalesDaily.bulkCreate(seedData.dailySales);

      // 9. Initial Carts for active users
      for (const user of seedData.users) {
        if (user.role === 'CUSTOMER') {
          const cart = await Cart.create({ user_id: user.id });
          if (user.id === 2) {
            await CartItem.create({ cart_id: cart.id, product_id: 11, quantity: 1 });
            await CartItem.create({ cart_id: cart.id, product_id: 43, quantity: 1 });
          }
        }
      }

      console.log('[Database] Seeding completed: 52 products, 8 users, orders, events & 182 daily sales records loaded.');
    } else {
      console.log(`[Database] Database already populated (${countUsers} users present). Skipping seed.`);
    }
  } catch (error) {
    console.error('[Database] Initialization error:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  initDB,
  User,
  Category,
  Product,
  ProductFeature,
  Cart,
  CartItem,
  Order,
  OrderItem,
  UserEvent,
  SearchLog,
  RecommendationLog,
  SalesDaily
};
