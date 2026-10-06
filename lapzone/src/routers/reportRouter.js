const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Middleware kiểm tra đăng nhập admin
function checkAdminAuth(req, res, next) {
    console.log('SESSION:', req.session);
    if (!req.session || !req.session.user || req.session.user.userType !== 'qtv') {
      console.log('AUTH FAIL');
      return res.redirect('/');
    }
    console.log('AUTH PASS');
    next();
  }

const requireAuth = require('../middleware/auth').requireAdmin;

router.get('/', requireAuth, productController.showReport);

module.exports = router;
