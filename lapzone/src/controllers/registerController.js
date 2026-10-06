const KHModel = require('../models/KHModel');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const { hoTen, tenDangNhap, matKhau, email, soDienThoai } = req.body;
    // 1. Kiểm tra dữ liệu nhập đầy đủ
    if (![hoTen, tenDangNhap, matKhau, email, soDienThoai].every(value => typeof value === 'string' && value.trim())) {
      return res.render('register', { error: 'Vui lòng nhập đầy đủ thông tin.', success: null });
    }
    if (hoTen.length > 255 || !/^[a-zA-Z0-9]{6,64}$/.test(tenDangNhap) || matKhau.length < 8 || matKhau.length > 128 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^0\d{9}$/.test(soDienThoai) || req.body.matKhau2 !== matKhau) {
      return res.status(400).render('register', { error: 'Kiểm tra tên đăng nhập, email, số điện thoại và mật khẩu nhập lại (ít nhất 8 ký tự).', success: null });
    }
    // 2. Kiểm tra trùng tên đăng nhập
    const existingUser = await KHModel.findByUsername(tenDangNhap);
    if (existingUser) {
      return res.render('register', { error: 'Tên đăng nhập đã tồn tại.', success: null });
    }
    // 3. Kiểm tra trùng email
    const existingEmail = await KHModel.findByEmail(email);
    if (existingEmail) {
      return res.render('register', { error: 'Email này đã được sử dụng.', success: null });
    }
    // 4. Kiểm tra trùng số điện thoại
    const existingPhone = await KHModel.findByPhone(soDienThoai);
    if (existingPhone) {
      return res.render('register', { error: 'Số điện thoại này đã được sử dụng.', success: null });
    }
    // 5. Sinh mã khách hàng ngẫu nhiên
    const maKhachHang = 'KH' + crypto.randomUUID();
    // 6. Lưu vào database
    await KHModel.createUser({
      maKhachHang,hoTen,tenDangNhap,matKhau, email, soDienThoai,trangThai: "Hoạt động"
    });

    return res.redirect('/login');
  }

  catch (err) {
    console.error(' Lỗi khi đăng ký:', err);
    return res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).render('register', { error: err.code === 'ER_DUP_ENTRY' ? 'Tên đăng nhập, email hoặc số điện thoại đã tồn tại.' : 'Lỗi máy chủ. Thử lại sau.', success: null });
  }
};

module.exports = { register };
