const express = require('express');
const router = express.Router();
const {
  getDashboardKPIs,
  updateOrderStatus,
  getAllUsers,
  getAllOrders,
  getSalesHistory
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardKPIs);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/sales-history', getSalesHistory);

module.exports = router;
