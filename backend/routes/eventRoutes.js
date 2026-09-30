const express = require('express');
const router = express.Router();
const { trackEvent } = require('../controllers/eventController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, trackEvent);

module.exports = router;
