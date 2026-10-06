// routers/searchRouter.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/resultSearch', searchController.searchProducts);

module.exports = router;
