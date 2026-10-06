function deny(req, res, status, message) {
  if (req.method !== 'GET' || req.path.includes('/api/') || req.accepts(['html', 'json']) === 'json') {
    return res.status(status).json({ success: false, message });
  }
  if (status === 401) return res.redirect('/login');
  return res.status(status).send(message);
}

function requireRole(role) {
  return async (req, res, next) => {
    const user = req.session?.user;
    if (!user) return deny(req, res, 401, 'Vui lòng đăng nhập.');
    if (user.userType !== role) return deny(req, res, 403, 'Bạn không có quyền truy cập chức năng này.');
    if (role === 'kh') {
      try {
        const [rows] = await require('../config/db').query('SELECT trangThai FROM KhachHang WHERE maKhachHang = ?', [user.maKhachHang]);
        if (!rows.length || rows[0].trangThai === 'Đã khóa') return deny(req, res, 403, 'Tài khoản không còn hoạt động.');
      } catch (error) { return next(error); }
    }
    next();
  };
}

module.exports = { requireCustomer: requireRole('kh'), requireAdmin: requireRole('qtv') };
