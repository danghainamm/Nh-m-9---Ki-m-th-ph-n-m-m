const KHModel = require('../models/KHModel');
const QTVModel = require('../models/QTVModel');
const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');

module.exports = async (req, res) => {
  try {
    const { tendangnhap, matkhau, vt } = req.body;
    if (typeof tendangnhap !== 'string' || typeof matkhau !== 'string' || !tendangnhap || !matkhau || !['kh', 'qtv'].includes(vt)) {
      return res.status(400).render('login', { error: 'Vui lòng nhập tài khoản, mật khẩu và chọn vai trò hợp lệ.' });
    }
    const user = await (vt === 'kh' ? KHModel : QTVModel).findByUsername(tendangnhap);
    if (!user || !await verifyPassword(matkhau, user.matKhau)) return res.status(401).render('login', { error: 'Sai tên đăng nhập hoặc mật khẩu.' });
    if (vt === 'kh' && user.trangThai === 'Đã khóa') return res.status(403).render('login', { error: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.' });
    if (!user.matKhau.startsWith('scrypt$')) {
      await db.query('UPDATE ?? SET matKhau = ? WHERE tenDangNhap = ?', [vt === 'kh' ? 'KhachHang' : 'QuanTriVien', await hashPassword(matkhau), user.tenDangNhap]);
    }
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.user = { maKhachHang: user.maKhachHang, maQuanTriVien: user.maQuanTriVien, id: user.tenDangNhap,
      name: user.hoTen, hoTen: user.hoTen, soDienThoai: user.soDienThoai, email: user.email, userType: vt };
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    res.redirect(vt === 'kh' ? '/kh/trangchu' : '/qtv/trangchu');
  } catch (error) {
    console.error('Login error:', error.code || error.message);
    res.status(500).render('login', { error: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
  }
};
