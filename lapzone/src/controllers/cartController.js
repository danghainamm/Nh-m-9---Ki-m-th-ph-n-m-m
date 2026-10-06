const CartModel = require('../models/cartModel');
const { randomUUID } = require('crypto');
const { quantity, text, fail } = require('../utils/validation');
const { transaction } = require('../services/checkout');

exports.viewCart = async (req, res) => {
  try {
    const cart = await CartModel.getCartDetailsByCustomerId(req.session.user.maKhachHang);
    res.render('cart', { title: 'Giỏ hàng của bạn', cart, khachHang: req.session.user });
  } catch (error) { res.status(500).send('Không thể tải giỏ hàng.'); }
};

async function mutate(req, res, action) {
  const data = req.method === 'GET' ? req.query : req.body;
  const amount = action === 'remove' ? 1 : quantity(action === 'add' ? data.soLuong ?? 1 : data.newQuantity);
  if (!text(data.maSanPham) || !amount) return res.status(400).json({ success: false, message: 'Số lượng phải là số nguyên dương.' });
  try {
    await transaction(async connection => {
      const customerId = req.session.user.maKhachHang;
      await connection.query('SELECT maKhachHang FROM KhachHang WHERE maKhachHang = ? FOR UPDATE', [customerId]);
      const [carts] = await connection.query('SELECT maGioHang FROM GioHang WHERE maKhachHang = ? FOR UPDATE', [customerId]);
      let cartId = carts[0]?.maGioHang;
      if (!cartId) {
        if (action !== 'add') throw fail('Sản phẩm không có trong giỏ hàng.', 404);
        cartId = randomUUID();
        await connection.query('INSERT INTO GioHang (maGioHang, tongTien, maKhachHang) VALUES (?, 0, ?)', [cartId, customerId]);
      }
      const [products] = await connection.query('SELECT soLuongTon FROM SanPham WHERE maSanPham = ? FOR UPDATE', [data.maSanPham]);
      if (!products.length) throw fail('Sản phẩm không tồn tại.', 404);
      const [items] = await connection.query('SELECT soLuong FROM ChiTietGioHang WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ? FOR UPDATE', [cartId, data.maSanPham]);
      if (action !== 'add' && !items.length) throw fail('Sản phẩm không có trong giỏ hàng.', 404);
      if (action === 'remove') {
        await connection.query('DELETE FROM ChiTietGioHang WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ?', [cartId, data.maSanPham]);
        return;
      }
      const nextAmount = action === 'add' ? (items[0]?.soLuong || 0) + amount : amount;
      if (nextAmount > products[0].soLuongTon) throw fail('Số lượng trong giỏ vượt quá tồn kho.', 409);
      await connection.query('INSERT INTO ChiTietGioHang (GioHangmaGioHang, SanPhammaSanPham, soLuong) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE soLuong = ?', [cartId, data.maSanPham, nextAmount, nextAmount]);
    });
    if (action !== 'add' && req.method === 'GET') return res.redirect('/cart');
    res.json({ success: true, message: action === 'remove' ? 'Đã xóa sản phẩm.' : 'Đã cập nhật giỏ hàng.' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể cập nhật giỏ hàng.' });
  }
}
exports.addItem = (req, res) => mutate(req, res, 'add');
exports.updateItem = (req, res) => mutate(req, res, 'update');
exports.removeItem = (req, res) => mutate(req, res, 'remove');
