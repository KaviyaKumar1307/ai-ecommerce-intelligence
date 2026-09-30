const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { initDB, sequelize } = require('./models');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const searchRoutes = require('./routes/searchRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'AI-Ecommerce Node Backend',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: {
      dialect: sequelize.getDialect(),
      connected: true
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'AI-Ecommerce Node Backend',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime())
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Server startup function
const startServer = async () => {
  try {
    console.log('[Server] Connecting to database...');
    await initDB();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Node.js Backend Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`🛒 REST APIs:    http://localhost:${PORT}/api/products`);
      console.log(`🧠 AI Bridge:    http://localhost:${PORT}/api/ai/status`);
      console.log(`=======================================================`);
    });

    return server;
  } catch (error) {
    console.error('[Server] Critical failure during startup:', error.message);
    process.exit(1);
  }
};

// Auto start if not imported by test suite
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
