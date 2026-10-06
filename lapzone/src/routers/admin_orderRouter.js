const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/admin_oderController');
const pool = require("../config/db");
router.use(require('../middleware/auth').requireAdmin);

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



// API kiểm tra và tạo khách hàng mới nếu chưa tồn tại
router.post("/api/checkOrCreateCustomer", async (req, res) => {
    const { tenKhachHang } = req.body;
    if (typeof tenKhachHang !== 'string' || !tenKhachHang.trim() || tenKhachHang.length > 255) return res.status(400).json({ success: false, message: 'Tên khách hàng không hợp lệ.' });

    try {
        // Kiểm tra tồn tại
        const [rows] = await pool.execute(
            "SELECT maKhachHang FROM KhachHang WHERE hoTen = ? LIMIT 1",
            [tenKhachHang]
        );

        if (rows.length > 0) {
            return res.json({
                success: true,
                maKhachHang: rows[0].maKhachHang,
                message: "Khách hàng đã tồn tại"
            });
        }

        // Nếu không có → tạo mới
        const newId = "KH" + Date.now(); // định dạng ID mới

        await pool.execute(
            `INSERT INTO KhachHang (maKhachHang, hoTen, tenDangNhap, email, matKhau)
             VALUES (?, ?, NULL, NULL, NULL)`,
            [newId, tenKhachHang]
        );

        return res.json({
            success: true,
            maKhachHang: newId,
            message: "Đã tạo khách hàng mới"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});


const requireAuth = require('../middleware/auth').requireAdmin;

// Hiển thị trang quản lý đơn hàng
router.get('/', requireAuth, OrderController.index);

// Hiển thị chi tiết đơn hàng
router.get('/chitiet/:maDonHang', requireAuth, OrderController.viewOrder);

// Hiển thị form tạo đơn hàng
router.get('/tao', requireAuth, OrderController.createOrderForm);

// Hiển thị form chỉnh sửa đơn hàng
router.get('/sua/:maDonHang', requireAuth, OrderController.editOrderForm);

// ===== API ROUTES =====

// Lấy danh sách đơn hàng (có thể lọc và tìm kiếm)
// ?status=...&paymentStatus=...&keyword=...
router.get('/api/orders', requireAuth, OrderController.getOrders);

// Tạo đơn hàng mới
router.post('/api/orders', requireAuth, OrderController.createOrder);

// Cập nhật đơn hàng
router.put('/api/orders/:maDonHang', requireAuth, OrderController.updateOrder);

// Cập nhật trạng thái đơn hàng
router.patch('/api/orders/:maDonHang/status', requireAuth, OrderController.updateStatus);

// Cập nhật trạng thái thanh toán
router.patch('/api/orders/:maDonHang/payment', requireAuth, OrderController.updatePaymentStatus);

// Cập nhật trạng thái giao hàng
router.patch('/api/orders/:maDonHang/delivery', requireAuth, OrderController.updateDeliveryStatus);

// Xóa đơn hàng
router.delete('/api/orders/:maDonHang', requireAuth, OrderController.deleteOrder);

// Lấy thống kê đơn hàng
router.get('/api/statistics', requireAuth, OrderController.getStatistics);

module.exports = router;
