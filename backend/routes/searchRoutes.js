const express = require('express');
const router = express.Router();
const { searchKeyword } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, searchKeyword);

module.exports = router;
