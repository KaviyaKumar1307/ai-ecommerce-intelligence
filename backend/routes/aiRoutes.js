const express = require('express');
const router = express.Router();
const {
  semanticSearch,
  getRecommendations,
  shoppingAssistant,
  getForecast,
  getSegments,
  getAIStatus
} = require('../controllers/aiController');
const { optionalAuth, protect, adminOnly } = require('../middleware/authMiddleware');

// Public & Customer AI Endpoints
router.all('/search', optionalAuth, semanticSearch);
router.all('/recommend', optionalAuth, getRecommendations);
router.post('/assistant', optionalAuth, shoppingAssistant);
router.get('/status', getAIStatus);

// Admin-level AI Analytics Endpoints
router.get('/forecast', protect, adminOnly, getForecast);
router.get('/segments', protect, adminOnly, getSegments);

module.exports = router;
