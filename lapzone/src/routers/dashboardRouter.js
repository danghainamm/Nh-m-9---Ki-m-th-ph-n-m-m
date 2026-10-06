const express = require('express')
const router = express.Router();
const {
    getDashboardKhachHang,
    getDashboardQTV
} = require('../controllers/dashboardController')

router.get('/', getDashboardKhachHang);

router.get('/kh/trangchu', getDashboardKhachHang);
router.get('/qtv/trangchu', require('../middleware/auth').requireAdmin, (req, res, next) => Promise.resolve(getDashboardQTV(req, res)).catch(next));

module.exports = router;
