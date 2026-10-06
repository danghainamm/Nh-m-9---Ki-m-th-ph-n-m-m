const db = require('../config/db');
const { transaction } = require('../services/checkout');
const { text, fail } = require('../utils/validation');
exports.showQRPaymentPage = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM DonHang WHERE maDonHang = ? AND maKhachHang = ?', [req.params.maDonHang, req.session.user.maKhachHang]);
    if (!rows.length) return res.status(404).send('Không tìm thấy đơn hàng.');
    if (rows[0].trangThai === 'Đã hủy') return res.status(409).send('Đơn hàng đã hủy.');
    res.render('payment', { order: rows[0], khachHang: req.session.user });
  } catch (error) { res.status(500).send('Không thể tải trang thanh toán.'); }
};
exports.verifyPayment = async (req, res) => {
  try {
    if (!text(req.body.maDonHang)) throw fail('Mã đơn hàng không hợp lệ.');
    await transaction(async connection => {
      const [rows] = await connection.query('SELECT * FROM DonHang WHERE maDonHang = ? AND maKhachHang = ? FOR UPDATE', [req.body.maDonHang, req.session.user.maKhachHang]);
      if (!rows.length) throw fail('Không tìm thấy đơn hàng.', 404);
      const order = rows[0];
      if (order.trangThai === 'Đã hủy') throw fail('Đơn hàng đã hủy.', 409);
      if (order.phuongThucThanhToan.startsWith('Đã thanh toán')) return;
      if (!order.phuongThucThanhToan.includes('Ngân hàng')) throw fail('Đơn hàng này không dùng chuyển khoản.', 409);
      await connection.query("UPDATE DonHang SET phuongThucThanhToan='Chờ xác nhận - Ngân hàng' WHERE maDonHang=?", [order.maDonHang]);
    });
    res.json({ success: true, message: 'Đã ghi nhận yêu cầu. Quản trị viên sẽ kiểm tra và xác nhận thanh toán.' });
  } catch (error) { res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể gửi yêu cầu thanh toán.' }); }
};
