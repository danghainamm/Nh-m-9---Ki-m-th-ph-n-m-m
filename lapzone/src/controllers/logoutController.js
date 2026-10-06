// src/controllers/logoutController.js
const logout = (req, res) => {
  // Nếu đang có session
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Lỗi khi đăng xuất:', err);
        return res.status(500).send('Lỗi khi đăng xuất');
      }
      // Xóa cookie session (nếu có)
      res.clearCookie('connect.sid');
      // Chuyển hướng về trang chủ hoặc login
      res.redirect('/');
    });
  } else {
    // Nếu chưa đăng nhập mà truy cập /logout
    res.redirect('/');
  }
};

module.exports = { logout };
