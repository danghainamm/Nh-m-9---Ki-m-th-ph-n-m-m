const express = require('express');
const router = express.Router();
const KhoController = require('../controllers/admin_warehouseController');
const { requireAdmin } = require('../middleware/auth');

// Middleware kiểm tra đăng nhập admin
function checkAdminAuth(req, res, next) {

  if (!req.session || !req.session.user || req.session.user.userType !== 'qtv') {
    return requireAdmin(req, res, next);
  }
  next();
}



router.get('/', requireAdmin, KhoController.showKhoPage);
router.get('/search', requireAdmin, KhoController.searchProducts);
router.post('/update/:maSP', requireAdmin, KhoController.updateProduct);
router.post('/import', requireAdmin, KhoController.importStock);
router.post('/import-file', requireAdmin, async (req, res) => {
  const { items } = req.body;
  const { text, fail } = require('../utils/validation');
  if (!Array.isArray(items) || !items.length || items.length > 500 ||
      items.some(item => !item || !text(item.maSP) || typeof item.soLuongTon !== 'number' || !Number.isSafeInteger(item.soLuongTon) || item.soLuongTon < 0 || item.soLuongTon > 100000) ||
      new Set(items.map(item => item.maSP)).size !== items.length) {
    return res.status(400).json({ success: false, message: 'File cần 1–500 dòng, mã sản phẩm không trùng và tồn kho nguyên không âm.' });
  }
  try {
    await require('../services/checkout').transaction(async connection => {
      for (const item of [...items].sort((a, b) => a.maSP.localeCompare(b.maSP))) {
        const [rows] = await connection.query('SELECT maSanPham FROM SanPham WHERE maSanPham = ? FOR UPDATE', [item.maSP]);
        if (!rows.length) throw fail('Không tìm thấy sản phẩm ' + item.maSP, 404);
        await connection.query('UPDATE SanPham SET soLuongTon = ? WHERE maSanPham = ?', [item.soLuongTon, item.maSP]);
      }
    });
    res.json({ success: true, message: 'Đã cập nhật tồn kho ' + items.length + ' sản phẩm.' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể cập nhật file.' });
  }
});
router.post('/export', requireAdmin, KhoController.exportStock);
router.get('/statistics', requireAdmin, KhoController.getStatistics);

module.exports = router;
